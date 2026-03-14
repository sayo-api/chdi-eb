const Schedule = require('../models/Schedule');
const Notification = require('../models/Notification');

async function notifyScheduleChange(schedule, type, previousSoldierIds = []) {
  const currentIds = schedule.entries.map(e => String(e.soldier._id || e.soldier));
  const prevIds = previousSoldierIds.map(String);
  const addedIds   = currentIds.filter(id => !prevIds.includes(id));
  const removedIds = prevIds.filter(id => !currentIds.includes(id));
  const dateStr = new Date(schedule.date).toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'2-digit', year:'numeric' });
  const notifications = [];
  addedIds.forEach(id => notifications.push({ user: id, type: 'schedule_added', title: '📋 Você foi escalado!', message: `Você foi adicionado à escala de serviço do dia ${dateStr}.`, relatedDate: schedule.date }));
  removedIds.forEach(id => notifications.push({ user: id, type: 'schedule_removed', title: '🔔 Escala alterada', message: `Você foi removido da escala de serviço do dia ${dateStr}.`, relatedDate: schedule.date }));
  if (type === 'updated') {
    currentIds.filter(id => prevIds.includes(id)).forEach(id =>
      notifications.push({ user: id, type: 'schedule_changed', title: '🔄 Escala atualizada', message: `A escala de serviço do dia ${dateStr} foi atualizada.`, relatedDate: schedule.date })
    );
  }
  if (notifications.length > 0) await Notification.insertMany(notifications);
}

exports.listAll = async (req, res) => {
  try {
    const { year, month } = req.query;
    let filter = {};
    if (year && month) {
      filter.date = { $gte: new Date(Number(year), Number(month)-1, 1), $lte: new Date(Number(year), Number(month), 0, 23, 59, 59) };
    }
    const schedules = await Schedule.find(filter).populate('entries.soldier','name soldierNumber rank').sort({ date: 1 });
    res.json({ schedules });
  } catch { res.status(500).json({ message: 'Erro ao buscar escalas.' }); }
};

exports.mySchedule = async (req, res) => {
  try {
    const schedules = await Schedule.find({ 'entries.soldier': req.appUser._id }).populate('entries.soldier','name soldierNumber rank').sort({ date: 1 });
    res.json({ schedules });
  } catch { res.status(500).json({ message: 'Erro ao buscar sua escala.' }); }
};

exports.allActive = async (req, res) => {
  try {
    const { year, month } = req.query;
    let filter = {};
    if (year && month) {
      filter.date = { $gte: new Date(Number(year), Number(month)-1, 1), $lte: new Date(Number(year), Number(month), 0, 23, 59, 59) };
    } else {
      const start = new Date(); start.setDate(1);
      const end = new Date(start); end.setMonth(end.getMonth() + 3);
      filter.date = { $gte: start, $lte: end };
    }
    const schedules = await Schedule.find(filter).populate('entries.soldier','name soldierNumber rank').sort({ date: 1 });
    res.json({ schedules });
  } catch { res.status(500).json({ message: 'Erro ao buscar escalas.' }); }
};

exports.upsert = async (req, res) => {
  try {
    const { date, entries, title, notes } = req.body;
    if (!date) return res.status(422).json({ message: 'Data é obrigatória.' });
    const dayStart = new Date(date); dayStart.setHours(0,0,0,0);
    const existing = await Schedule.findOne({ date: dayStart });
    const previousSoldierIds = existing ? existing.entries.map(e => String(e.soldier)) : [];
    const notifType = existing ? 'updated' : 'created';
    const schedule = await Schedule.findOneAndUpdate(
      { date: dayStart },
      { date: dayStart, entries: entries || [], title: title || '', notes: notes || '', createdBy: req.user._id },
      { upsert: true, new: true }
    );
    await schedule.populate('entries.soldier','name soldierNumber rank');
    await notifyScheduleChange(schedule, notifType, previousSoldierIds);
    res.json({ message: 'Escala salva com sucesso.', schedule });
  } catch (err) { console.error(err); res.status(500).json({ message: 'Erro ao salvar escala.' }); }
};

exports.remove = async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);
    if (!schedule) return res.status(404).json({ message: 'Escala não encontrada.' });
    const dateStr = new Date(schedule.date).toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'2-digit', year:'numeric' });
    const notifs = schedule.entries.map(e => ({ user: e.soldier, type: 'schedule_removed', title: '❌ Escala cancelada', message: `A escala de serviço do dia ${dateStr} foi cancelada.`, relatedDate: schedule.date }));
    if (notifs.length > 0) await Notification.insertMany(notifs);
    await schedule.deleteOne();
    res.json({ message: 'Escala removida.' });
  } catch { res.status(500).json({ message: 'Erro ao remover escala.' }); }
};

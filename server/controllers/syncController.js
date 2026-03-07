const SyncVersion = require('../models/SyncVersion');
const Category   = require('../models/Category');
const Song       = require('../models/Song');

/**
 * GET /api/sync/status
 * Público — retorna versão atual e contagem de conteúdo.
 * O app chama isso na splash para decidir se precisa sincronizar.
 */
exports.getStatus = async (req, res) => {
  try {
    // Garante que o documento existe (cria com versão 0 se for o primeiro acesso)
    let syncDoc = await SyncVersion.findOne();
    if (!syncDoc) {
      syncDoc = await SyncVersion.create({ version: 0, publishedAt: new Date(), note: 'Versão inicial' });
    }

    const [catCount, songCount] = await Promise.all([
      Category.countDocuments({ active: true }).catch(() => Category.countDocuments()),
      Song.countDocuments({ active: true }).catch(() => Song.countDocuments()),
    ]);

    res.json({
      version: syncDoc.version,
      publishedAt: syncDoc.publishedAt,
      publishedBy: syncDoc.publishedBy,
      note: syncDoc.note,
      stats: { categories: catCount, songs: songCount },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao obter status de sincronização.' });
  }
};

/**
 * POST /api/sync/publish  [admin only]
 * Incrementa a versão — sinaliza ao app que há conteúdo novo para baixar.
 */
exports.publish = async (req, res) => {
  try {
    const { note = '' } = req.body;
    const adminName = req.user?.name || 'admin';

    let syncDoc = await SyncVersion.findOne();
    if (!syncDoc) {
      syncDoc = new SyncVersion({ version: 0 });
    }

    syncDoc.version    += 1;
    syncDoc.publishedAt = new Date();
    syncDoc.publishedBy = adminName;
    syncDoc.note        = note;
    await syncDoc.save();

    const [catCount, songCount] = await Promise.all([
      Category.countDocuments({ active: true }).catch(() => Category.countDocuments()),
      Song.countDocuments({ active: true }).catch(() => Song.countDocuments()),
    ]);

    res.json({
      message: `Versão ${syncDoc.version} publicada. Apps receberão a atualização.`,
      version: syncDoc.version,
      publishedAt: syncDoc.publishedAt,
      publishedBy: syncDoc.publishedBy,
      note: syncDoc.note,
      stats: { categories: catCount, songs: songCount },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro ao publicar.' });
  }
};

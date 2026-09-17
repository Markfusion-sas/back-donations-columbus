/**
 * Servicio del contenido editable del sitio (CMS).
 * @param {object} deps
 * @param {import('sequelize').ModelStatic} deps.SiteContent
 */
export const siteContentServiceFactory = ({ SiteContent }) => {

  /**
   * Devuelve todas las sobreescrituras agrupadas por idioma:
   * { es: { 'hero.title': '...', 'img.hero.banner1': 'https://...' }, en: { ... } }
   */
  const getAll = async() => {
    const rows = await SiteContent.findAll({ attributes: ['clave', 'idioma', 'valor', 'tipo'] });
    const result = { es: {}, en: {} };
    rows.forEach((row) => {
      result[row.idioma] ??= {};
      result[row.idioma][row.clave] = row.valor;
    });
    return result;
  };

  /**
   * Guarda un lote de cambios. Un valor vacío elimina la fila (vuelve al valor por defecto).
   * @param {Array<{clave:string, idioma:'es'|'en', valor:string, tipo?:'text'|'image'}>} items
   * @returns {Promise<{saved:number, removed:number}>}
   */
  const saveMany = async(items) => {
    let saved = 0;
    let removed = 0;

    for (const item of items) {
      const where = { clave: item.clave, idioma: item.idioma };
      const valor = typeof item.valor === 'string' ? item.valor : '';

      if (!valor.trim()) {
        removed += await SiteContent.destroy({ where });
        continue;
      }

      const [row, created] = await SiteContent.findOrCreate({
        where,
        defaults: { ...where, valor, tipo: item.tipo || 'text' }
      });
      if (!created) await row.update({ valor, tipo: item.tipo || row.tipo });
      saved += 1;
    }

    return { saved, removed };
  };

  return { getAll, saveMany };

};

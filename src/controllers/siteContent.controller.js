import Joi from 'joi';

import { siteContentService } from '#services/index';

const itemsSchema = Joi.object({
  items: Joi.array().items(Joi.object({
    clave: Joi.string().max(200).pattern(/^[\w.-]+$/).required(),
    idioma: Joi.string().valid('es', 'en').required(),
    valor: Joi.string().allow('').max(20000).required(),
    tipo: Joi.string().valid('text', 'image').default('text')
  })).min(1).max(500).required()
});

export const siteContentControllerFactory = () => {

  /** GET /contenido — sobreescrituras públicas por idioma */
  const getContent = async(req, res, next) => {
    try {
      const data = await siteContentService.getAll();
      res.set('Cache-Control', 'no-store');
      return res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  };

  /** PUT /contenido — guarda un lote { items: [{ clave, idioma, valor, tipo }] } */
  const saveContent = async(req, res, next) => {
    try {
      const { error, value } = itemsSchema.validate(req.body ?? {}, { abortEarly: true });
      if (error) {
        const err = new Error(error.details[0].message);
        err.statusCode = 400;
        throw err;
      }

      const result = await siteContentService.saveMany(value.items);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };

  /** POST /contenido/imagen — sube una imagen y devuelve su URL */
  const uploadImage = (req, res) => {
    return res.status(201).json({ success: true, data: { url: req.imagenUrl } });
  };

  return { getContent, saveContent, uploadImage };

};

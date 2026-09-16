import { donationCertificateService, donationService } from '#services/index';

export const donationControllerFactory = () => {
  
  const createDonation = async(req, res, next) => {

    try {
      const data = req.body;
      
      const { donation_destination: ddest , ...rest } = data;
      const donation_destination = ddest[0] || '';

      const dataFormatted = { donation_destination, ...rest };

      const donation = await donationService.saveDonation(dataFormatted);

      return res.status(200).json({
        success: true,
        data: {
          reference: donation.reference,
          name: donation.name,
        }
      });

    } catch (error) {
      next(error);
    }

  };

  /** POST /donation/certificado — solicitud de certificado (multipart/form-data con `documento`) */
  const requestCertificate = async(req, res, next) => {
    try {
      const certificado = await donationCertificateService.createCertificateRequest(req.certificado);

      return res.status(201).json({
        success: true,
        data: certificado
      });
    } catch (error) {
      next(error);
    }
  };

  /** PATCH /donation/certificado/:id — asocia la solicitud con la referencia de la donación */
  const linkCertificate = async(req, res, next) => {
    try {
      const certificado = await donationCertificateService.linkToDonation(req.params.id, req.body.reference);

      return res.status(200).json({
        success: true,
        data: certificado
      });
    } catch (error) {
      next(error);
    }
  };

  return { createDonation, requestCertificate, linkCertificate };

};

import { mongooseConnect } from "@/lib/mongoose";
import { Company } from "@/models/Company";
import { isAdminRequest } from "./auth/[...nextauth]";
import mongoose from 'mongoose';

export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();
  await isAdminRequest(res, req);




  if (method === "GET") {
    if (req.query.ibans && req.query.name) {
      try {
        const company = await Company.findOne({ name: req.query.name });
        console.log(company)
        if (!company) {
          throw new Error('Компанію не знайдено за ім\'ям');
        }
        const ibans = company.requisites.map(requisite => requisite.IBAN);
        res.json(ibans);
      } catch (error) {
        console.error("Помилка при отриманні IBAN компанії:", error);
        res.status(500).json({ error: error.message });
      }

    } else if (req.query?.id) {
      try {
        if (!mongoose.Types.ObjectId.isValid(req.query.id)) {
          throw new Error('Невірний формат ідентифікатора');
        }
        const company = await Company.findOne({ _id: req.query.id });
        if (!company) {
          throw new Error('Компанію не знайдено');
        }
        res.json(company);
      } catch (error) {
        console.error("Помилка при отриманні компанії:", error);
        res.status(500).json({ error: "Помилка при отриманні компанії" });
      }
    } else {
      try {
        const companies = await Company.find();
        res.json(companies);
      } catch (error) {
        console.error("Помилка при отриманні списку компаній:", error);
        res.status(500).json({ error: "Помилка при отриманні списку компаній" });
      }
    }
  }


  if (method === "POST") {
    try {
      const {
        name,
        address,
        site,
        invoce,
        requisites,
        tel,
      } = req.body;

      const formattedRequisites = requisites.map(requisite => ({
        MFO: requisite.MFO,
        IBAN: requisite.IBAN,
        EDRPOU: requisite.EDRPOU,
        IPN: requisite.IPN,
        address: requisite.address
      }));

      const companyDoc = await Company.create({
        name,
        address,
        site,
        invoce,
        requisites: formattedRequisites,
        tel,
      });

      res.json(companyDoc);
    } catch (error) {
      res.status(500).json({ error: "Помилка при створенні компанії." });
    }
  }

  if (method === "PUT") {
    try {
      const {
        name,
        address,
        site,
        invoce,
        requisites,
        tel,
        _id
      } = req.body;
      const formattedRequisites = requisites.map(requisite => ({
        MFO: requisite.MFO,
        IBAN: requisite.IBAN,
        EDRPOU: requisite.EDRPOU,
        IPN: requisite.IPN,
        address: requisite.address
      }));

      const companyDoc = await Company.findOneAndUpdate(
        { _id },
        {
          name,
          address,
          site,
          invoce,
          requisites: formattedRequisites,
          tel,
        },
        { new: true }
      );
      res.json(companyDoc);
    } catch (error) {
      res.status(500).json({ error: "Помилка при оновленні компанії." });
    }
  }

  if (method === "DELETE") {
    try {
      const { _id } = req.query;
      await Company.deleteOne({ _id });
      res.json({ message: "Компанія видалена успішно." });
    } catch (error) {
      res.status(500).json({ error: "Помилка при видаленні компанії." });
    }
  }
}
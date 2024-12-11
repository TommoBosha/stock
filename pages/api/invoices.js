import mongoose from 'mongoose';

import { isAdminRequest } from "./auth/[...nextauth]";

import { mongooseConnect } from "@/lib/mongoose";
import { Invoice } from '@/models/Ivoce';
import { Company } from '@/models/Company';
import { Components } from '@/models/Components';


export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();
  await isAdminRequest(res, req);


  const { companyId } = req.query;

  if (method === "GET") {
    try {
      if (companyId) {

        const invoices = await Invoice.find({ company: companyId }).populate('company').populate('components.component');
        res.json(invoices);
      } else {

        const invoices = await Invoice.find().populate('company');
        res.json(invoices);
      }
    } catch (error) {
      console.error("Помилка при отриманні накладних:", error);
      res.status(500).json({ error: "Помилка при отриманні накладних" });
    }
  }

  if (method === "POST") {
    try {
      const {
        invoceNumber,
        company: companyId,
        IBAN,
        components,
        data,
        totalPrice,
        withVAT,
        priceWithoutVAT,
        VAT,
        totalPriceWithVAT,
        discount,
        discountValue,
      } = req.body;

      if (typeof discount !== 'boolean' || (discount && typeof discountValue !== 'string')) {
        return res.status(400).json({ error: "Invalid discount or discountValue field." });
      }

      const companyIdObject = new mongoose.Types.ObjectId(companyId);
      const foundCompany = await Company.findById(companyIdObject);

      const existingComponents = await Promise.all(components.map(async (component) => {
        const existingComponent = await Components.findOne({ name: component.name, company: foundCompany._id });
        if (existingComponent) {

          existingComponent.quantity += parseInt(component.quantity);
          existingComponent.unitPrice = component.unitPrice;
          await existingComponent.save();
          return existingComponent;
        } else {

          const existingComponentForAnotherCompany = await Components.findOne({ name: component.name });
          if (existingComponentForAnotherCompany) {

            if (!existingComponentForAnotherCompany.company.includes(foundCompany._id)) {

              existingComponentForAnotherCompany.company.push(foundCompany._id);
            }
            existingComponentForAnotherCompany.quantity += parseInt(component.quantity);
            existingComponentForAnotherCompany.unitPrice = component.unitPrice;
            await existingComponentForAnotherCompany.save();
            return existingComponentForAnotherCompany;
          } else {

            const newComponent = await Components.create({
              name: component.name,
              unitPrice: component.unitPrice,
              company: foundCompany._id,
              quantity: component.quantity,
              minQuantity: component.minQuantity,
            });
            return newComponent;
          }
        }
      }));

      const invoiceData = {
        invoceNumber,
        company: companyIdObject,
        IBAN,
        components: components.map(component => ({
          component: component._id,
          name: component.name,
          quantity: component.quantity,
          unitPrice: component.unitPrice,
          minQuantity: component.minQuantity,
          totalPrice: (component.unitPrice * component.quantity).toFixed(2),
        })),
        data,
        totalPrice,
        discount: req.body.discount,
        discountValue: req.body.discountValue,
        withVAT: req.body.withVAT,
      };

      if (withVAT) {
        invoiceData.priceWithoutVAT = priceWithoutVAT;
        invoiceData.VAT = VAT;
        invoiceData.totalPriceWithVAT = totalPriceWithVAT;
      }

      const invoiceDoc = await Invoice.create(invoiceData);


      await Company.findByIdAndUpdate(
        foundCompany._id,
        { $push: { invoice: invoiceDoc._id } },
        { new: true }
      );

      res.json({ invoice: invoiceDoc, components: existingComponents });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Помилка при створенні накладної." });
    }
  }


  if (method === "PUT") {
    try {
      const {
        _id,
        invoceNumber,
        company,
        components,
        data,
        totalPrice,
        withVAT,
        priceWithoutVAT,
        VAT,
        totalPriceWithVAT,
        discount,
        discountValue,
      } = req.body;

      const updatedInvoice = await Invoice.findByIdAndUpdate(
        _id,
        {
          invoceNumber,
          company,
          components,
          data,
          totalPrice,
          withVAT,
          priceWithoutVAT,
          VAT,
          totalPriceWithVAT,
          discount,
          discountValue,
        },
        { new: true }
      );

      if (!updatedInvoice) {
        return res.status(404).json({ error: "Накладну не знайдено." });
      }

      res.json(updatedInvoice);
    } catch (error) {
      console.error("Error updating invoice:", error);
      res.status(500).json({ error: "Помилка при оновленні накладної." });
    }
  }

  if (method === "DELETE") {
    try {
      const { _id } = req.query;


      const deletedInvoice = await Invoice.findById(_id);


      if (!deletedInvoice) {
        return res.status(404).json({ error: "Накладна не знайдена." });
      }


      const companyId = deletedInvoice.company;
      const foundCompany = await Company.findById(companyId);


      if (!foundCompany) {
        return res.status(404).json({ error: "Компанія не знайдена." });
      }


      const componentsToDelete = deletedInvoice.components;


      await Promise.all(componentsToDelete.map(async (component) => {
        const existingComponent = await Components.findOne({ name: component.name, company: foundCompany._id });
        console.log(existingComponent)
        if (existingComponent) {
          existingComponent.quantity -= component.quantity;
          await existingComponent.save();
        }
      }));


      await Invoice.deleteOne({ _id });

      res.json({ message: "Накладна видалена успішно." });
    } catch (error) {
      res.status(500).json({ error: "Помилка при видаленні накладної." });
    }
  }
}
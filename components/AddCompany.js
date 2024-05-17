import React, { useState } from "react";
import axios from "axios";

const AddCompany = ({ fetchCompany }) => {
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    site: "",
    invoce: [],
    requisites: [{
      MFO: "",
      IBAN: "UA",
      EDRPOU: "",
      IPN: "",
      address: "",
    }],
    tel: "",
  });


  const handleChange = (e) => {
    if (e.target.name.includes("requisites")) {
      const requisites = { ...formData.requisites, [e.target.name.split(".")[1]]: e.target.value };
      setFormData({ ...formData, requisites });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleChangeRequisite = (e, index) => {
    const updatedRequisites = [...formData.requisites];
    updatedRequisites[index] = {
      ...updatedRequisites[index],
      [e.target.name.split(".")[1]]: e.target.value
    };
    setFormData({ ...formData, requisites: updatedRequisites });
  };

  const handleAddRequisitesGroup = () => {
    setFormData({
      ...formData,
      requisites: [
        ...formData.requisites,
        {
          MFO: "",
          IBAN: "",
          EDRPOU: "",
          IPN: "",
          address: ""
        }
      ]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/companies", formData);

      setFormData({
        name: "",
        address: "",
        site: "",
        invoce: [],
        requisites: [{
          MFO: "",
          IBAN: "",
          EDRPOU: "",
          IPN: "",
          address: "",
        }],
        tel: "",
      });
      document.getElementById("my_modal_5").close();
      fetchCompany();
    } catch (error) {
      console.error("Помилка при додаванні компанії:", error);
    }
  };

  return (
    <div className="py-[8px]">
      <button
        className="btn bg-accent"
        onClick={() => document.getElementById("my_modal_5").showModal()}
      >
        Додати компанію
      </button>
      <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
        <div className="modal-box p-6 bg-white shadow-xl rounded-md">
          <h3 className="font-bold text-lg mb-4">Додати компанію</h3>
          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="text"
              name="name"
              placeholder="Назва компанії"
              value={formData.name}
              className="input input-bordered w-full"
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="address"
              placeholder="Адреса"
              className="input input-bordered w-full"
              value={formData.address}
              onChange={handleChange}
            />
            <input
              type="text"
              name="site"
              placeholder="Сайт"
              className="input input-bordered w-full"
              value={formData.site}
              onChange={handleChange}
            />
            <input
              type="text"
              name="tel"
              placeholder="Телефон"
              className="input input-bordered w-full"
              value={formData.tel}
              onChange={handleChange}
            />

            {formData.requisites.map((requisite, index) => (
              <div key={index}>
                <input
                  type="text"
                  name={`requisites[${index}].address`}
                  placeholder="Юр. адреса"
                  className="input input-bordered w-full"
                  value={requisite ? requisite.address : ""}
                  onChange={(e) => handleChangeRequisite(e, index)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    name={`requisites[${index}].MFO`}
                    placeholder="МФО"
                    className="input input-bordered"
                    value={requisite ? requisite.MFO : ""}
                    onChange={(e) => handleChangeRequisite(e, index)}
                  />
                  <input
                    type="text"
                    name={`requisites[${index}].IBAN`}
                    placeholder="IBAN"
                    className="input input-bordered"
                    value={requisite ? requisite.IBAN : ""}
                    onChange={(e) => handleChangeRequisite(e, index)}
                  />
                  <input
                    type="text"
                    name={`requisites[${index}].EDRPOU`}
                    placeholder="ЄДРПОУ/ДРФО"
                    className="input input-bordered"
                    value={requisite ? requisite.EDRPOU : ""}
                    onChange={(e) => handleChangeRequisite(e, index)}
                  />
                  <input
                    type="text"
                    name={`requisites[${index}].IPN`}
                    placeholder="ІПН"
                    className="input input-bordered"
                    value={requisite ? requisite.IPN : ""}
                    onChange={(e) => handleChangeRequisite(e, index)}
                  />
                </div>
              </div>
            ))}
            <div className="flex justify-end space-x-2">
              <button type="button" className=" btn-primary" onClick={handleAddRequisitesGroup}>Додати групу реквізитів</button>
              <button type="submit" className="btn btn-outline ">
                Додати
              </button>
              <button
                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                onClick={() => document.getElementById("my_modal_5").close()}
              >
                ✕
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
};

export default AddCompany;
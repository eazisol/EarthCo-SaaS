import React, { useState, useEffect, useRef } from "react";
import { LoadScript } from "@react-google-maps/api";

const AdressModal = ({
  boolState,
  handleAdress,
  adress,
  setAdress,
  topClass,
}) => {
  const autocompleteRef = useRef(null);
  // const [adress, setadress] = useState(adress)

  useEffect(() => {
    if (autocompleteRef.current) {
      const autocomplete = new window.google.maps.places.Autocomplete(
        autocompleteRef.current
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        if (place.address_components) {
          const addressObject = {
            adressLine: "",
            room: "",
            city: "",
            state: "",
            postalCode: "",
            country: "",
          };

          place.address_components.forEach((component) => {
            switch (component.types[0]) {
              case "street_number":
                addressObject.adressLine += component.long_name;
                break;
              case "route":
                addressObject.adressLine += " " + component.long_name;
                break;
              case "locality":
                addressObject.city = component.long_name;
                break;
              case "administrative_area_level_1":
                addressObject.state = component.short_name;
                break;
              case "postal_code":
                addressObject.postalCode = component.long_name;
                break;
              case "country":
                addressObject.country = component.long_name;
                break;
              default:
                break;
            }
          });

          setAdress(addressObject);
          console.log("oooooooooo",addressObject)
        }
      });
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    boolState(true);
  };

  const handleChange = (event) => {
    const value = event.target.value;
    setAdress({
      ...adress,
      [event.target.name]: value,
    });
  };

  const adressLine = adress.adressLine || "";
  const roomNo = (adress.room && ", " + adress.room) || "";
  const city = (adress.city && ", " + adress.city) || "";
  const adState = (adress.state && ", " + adress.state) || "";
  const postCode = (adress.postalCode && ", " + adress.postalCode) || "";
  const country = (adress.country && ", " + adress.country) || "";

  handleAdress(adressLine + roomNo + city + adState + postCode + country);

  return (
    <LoadScript
      googleMapsApiKey="AIzaSyD-S-cuUziy083ZS2a2X_Btnr-msbXJFnw"
      libraries={["places"]}
    >
      <div className={"adressmodal " + topClass}>
        <div className="" style={{ margin: "5px" }}>
          <div className="card-header" style={{ background: "#f8f4f4" }}>
            <h4 className="card-title">Address</h4>
          </div>
          <div className="">
            <div className="">
              <form onSubmit={handleSubmit}>
                <div className="col-md-12 mb-2">
                  <input
                    ref={autocompleteRef}
                    type="text"
                    id="adressInput1"
                    onChange={handleChange}
                    value={adress.adressLine}
                    name="adressLine"
                    className="form-control input-default "
                    placeholder="Adress Line 1"
                  />
                </div>
                <div className="col-md-12 mb-2">
                  <input
                    type="text"
                    id="adressInput2"
                    onChange={handleChange}
                    value={adress.room}
                    name="room"
                    className="form-control input-default "
                    placeholder="Room / Suite / Apt #"
                  />
                </div>
                <div className="col-md-12 mb-2">
                  <input
                    type="text"
                    id="adressInput3"
                    onChange={handleChange}
                    value={adress.city}
                    name="city"
                    className="form-control input-default "
                    placeholder="City"
                  />
                </div>
                <div className="col-md-12 mb-2">
                  <input
                    type="text"
                    id="adressInput4"
                    onChange={handleChange}
                    value={adress.state}
                    name="state"
                    className="form-control input-default "
                    placeholder="State"
                  />
                </div>
                <div className="col-md-12 mb-2">
                  <input
                    type="text"
                    id="adressInput5"
                    onChange={handleChange}
                    value={adress.postalCode}
                    name="postalCode"
                    className="form-control input-default "
                    placeholder="Postal Code"
                  />
                </div>
                <div className="col-md-12 mb-2">
                  <input
                    type="text"
                    id="adressInput6"
                    onChange={handleChange}
                    value={adress.country}
                    name="country"
                    className="form-control input-default "
                    placeholder="Country"
                  />
                </div>
                <div className="col-md-12 mt-3 text-end">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="btn btn-primary"
                  >
                    Done
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </LoadScript>
  );
};

export default AdressModal;

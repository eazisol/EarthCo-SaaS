
const AdressConverter = (adressObj) => {
// conosle
    const adress = adressObj;
    const adressLine = adress.adressLine || '';
    const roomNo = (adress.room && (' / ' + adress.room)) || '';
    const city = (adress.city && (' / ' + adress.city)) || '';
    const adState = (adress.state && (' / ' + adress.state)) || '';
    const postCode = (adress.postalCode && (' / ' + adress.postalCode)) || '';
    const country = (adress.country && (' / ' + adress.country)) || '';

    const finalAdress = adressLine + roomNo + city + adState + postCode + country;

    return finalAdress;
}

export default AdressConverter

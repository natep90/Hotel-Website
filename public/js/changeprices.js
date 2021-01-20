function onJsonReady(json) {
    const priceTable = document.querySelector('#price-table');
    let total_room_types = json["data"].length;

    //create a variable for room price input field and buttons
    let room_price_update = '<form><input type="number" id="new_price"><button class="btn btn-info btn-sm m-2" id="price-btn">Update Room Price</button></form>';

    //create room price table, buttons and inputs.
    for (let i = 0; i < total_room_types; i++) {
        let room_row = `<tr><td>${json["data"][i]["r_class"]}</td><td>${json["data"][i]["price"]}</td> <td>${room_price_update}</td></tr>`;
        priceTable.innerHTML += room_row
    }

    //Selecting buttons and input areas based on their instances start 
    const price_btn = document.querySelectorAll('#price-btn');
    const price = document.querySelectorAll('#new_price');
    let newPrice = 0

    //For loop checks all buttons instance.
    for (let i = 0; i < price.length; i++) {

        changePrice = [];
        price_btn[i].onclick = (e) => {
            e.preventDefault();
            //get new price from instance ([i])
            newPrice = parseFloat(price[i].value);
            if (newPrice <= 0) {
                alert("Invalid. Price must be greater than £0!")
            } else {
                changePrice = {
                    r_class: json["data"][i]["r_class"],
                    price: newPrice
                }
            }
            //send the changed rom price and r_class as post request
            const serializedMessage = JSON.stringify(changePrice);
            fetch('/changePrice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: serializedMessage
            }
            )
            //refresh the screen to see new values
            window.location.reload()
        }
    }
    //Selecting buttons and input areas based on their instances ends

}

function onResponse(response) {
    return response.json()
}


fetch('/roomprices')
    .then(onResponse)
    .then(onJsonReady)

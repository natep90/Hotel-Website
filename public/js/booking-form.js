

function changeRoomName(input) {
    if (input === `std_t`) {
        return `Standard Twin`;
    } else if (input === `sup_d`) {
        return `Superior Double`;
    } else if (input === `std_d`) {
        return `Standard Double`;
    } else if (input === `sup_t`) {
        return `Superior Twin`;
    }
}

function calcPrice(orders, rates) {
    let totalPrice = 0;
    for (let i = 0; i < orders.length; i++) {
        for (let j = 0; j < rates.length; j++) {
            if (orders[i]['r_class'] === rates[j]['r_class']) {
                let price = rates[j]['price'] * ((Date.parse(orders[i]['checkout'].slice(0, 10)) - Date.parse(orders[i]['checkin'].slice(0, 10))) / (60 * 60 * 24 * 1000));
                totalPrice += price;
            }
        }
    }
    return totalPrice;
}

function getTotalPrice(rooms, roomRates) {
    let prices = [];
    for (let i = 0; i < rooms.length; i++) {
        for (let j = 0; j < roomRates.length; j++) {
            if (rooms[i].r_class === roomRates[j].r_class) {


                prices.push(((Date.parse(rooms[i].checkout.slice(0, 10)) - Date.parse(rooms[i].checkin.slice(0, 10))) / (60 * 60 * 24 * 1000)) * roomRates[j].price)

                // (Date.parse(rooms[i].checkout.slice(0, 10)) - Date.parse(rooms[i].checkin.slice(0,11)) * roomRates[j].price)

            }
        }
    }
    return prices
}

const form = document.querySelector('#form')




window.onload = async function () {
    
    let prices = [];
    await fetch('/getroomrates')
        .then(res => res.json())
        .then(data => {
            data.forEach(item => {
                prices.push(item)
            })
        })
    console.log(prices)
    let currentBookings = [];
    await fetch('/currentbooking')
        .then(res => res.json())
        .then(data => {
            data.forEach(item => {
                let div = document.createElement('tr');
                div.innerHTML = `

                <td>${changeRoomName(item['r_class'])}</td>
                <td>${item['checkin'].slice(0, 10)}</td>
                <td>${item['checkout'].slice(0, 10)}</td>

            `;

                document.querySelector('#booking-info').appendChild(div)
                currentBookings.push(item)
            })
        });
    let priceArray = await getTotalPrice(currentBookings, prices)

    let priceDiv = document.createElement('div');
    priceDiv.classList.add('price-div')
    priceDiv.innerHTML = ` Total Price: £${priceArray.reduce((a, b) => a + b, 0)}`
    document.querySelector('.price-div-container').appendChild(priceDiv)
}


// connect to cancel button
window.addEventListener('DOMContentLoaded', async e => {
    const cancelBtn = document.querySelector('#cancel_button');
    const bookBtn = document.querySelector('#book_button');
    cancelBtn.addEventListener('click', async e => {
        await fetch('/clearcurrentbooking')
            .then(res => res.json())
            .then(data => data)
        window.location.href = '/rooms'
    })

    const cardType = document.querySelector('#c_cardtype');
    const cName = document.querySelector('#c_name')
    const cEmail = document.querySelector('#c_email');
    const cardNo = document.querySelector('#c_cardno');
    const cardExp = document.querySelector('#c_cardexp');
    const cAddress = document.querySelector('#c_address')


    document.querySelector('#form-element').onsubmit = async e => {
        e.preventDefault();
        let current = []
        await fetch('/currentbooking')
            .then(res => res.json())
            .then(data => {
                data.forEach(item => {
                    current.push(item)
                })
            })

        let currentRates = []
        await fetch('/getroomrates')
            .then(res => res.json())
            .then(data => {
                data.forEach(item => {
                    currentRates.push(item)
                })
            })
        let message = {
            cardtype: cardType.value,
            name: cName.value,
            email: cEmail.value,
            address: cAddress.value,
            cardno: cardNo.value,
            cardexp: cardExp.value,
            bookingprice: calcPrice(current, currentRates),
            room: current
        }

        let serializedMessage = JSON.stringify(message)

        let uniqueOrder = []

        await fetch('/makebooking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: serializedMessage
        })
            .then(res => res.json())
            .then(data => uniqueOrder.push(data))

        window.location.href = `/confirmation/${uniqueOrder[0]['b_ref']}`

    }
})


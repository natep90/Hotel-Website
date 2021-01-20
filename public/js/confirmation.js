// change booking client side code
const changeBtn = document.querySelector('.change-booking-button-container button');
const addRoomBtn = document.querySelector('#add-room-btn');
const appendRoomToContainer = document.querySelector('.change-booking-content-container');

const newPricesContainer = document.querySelector('#additional-price-p');
const exisitingBookingRows = document.querySelectorAll('.existing-booking')
let confirmStatus = false;
//let currentClientRooms = 0;
// Add new room to room list

// exisitingBookingRows.forEach(row => {
//     currentClientRooms++
// })

addRoomBtn.addEventListener('click', (e) => {
    confirmStatus = false;
    //currentClientRooms++
    console.log('clicked')

    let div = document.createElement('div');

    div.classList.add('change-booking-content-container-row');
    div.classList.add('new-booking')
    div.innerHTML = `<div class="change-booking-content-container-row-r_class new">
    <select name="r_class" id="r_class">
        <option value="std_t">Standard Twin</option>
        <option value="std_d">Standard Double</option>
        <option value="sup_t">Superior Twin</option>
        <option value="sup_d">Superior Double</option>
    </select>
    <input type="date" class='checkin' value='2018-10-11'>
    <input type="date" class='checkout' value='2018-10-11'>
    <button class='remove-btn' onclick='removeFunc(this)'>Remove Room</button>
    <div class="individual-price"></div>
    </div>`
    appendRoomToContainer.appendChild(div)
})

function refreshPage() {
    location.reload()
}
window.onbeforeunload = function () {
    window.scrollTo(0, 0);
}

function removeFunc(ele) {
    //currentClientRooms--;
    ele.parentElement.parentElement.remove()
    newPricesContainer.innerHTML = `Please re-check availability to see the additional price and to proceed`
    confirmStatus = false;
    const indivudualPriceDiv = document.querySelectorAll('.individual-price');
    indivudualPriceDiv.forEach(div => {
        div.innerHTML = ''
    })
    const newBookings = document.querySelectorAll('.new-booking');
    newBookings.forEach(booking => {
        booking.style.backgroundColor = 'transparent'
    })
}

const calcRate = (r_class, checkin, checkout) => {
    return new Promise((resolve, reject) => {
        fetch('/getroomrates')
            .then(res => {
                return res.json()
            })
            .then(data => {
                for (let i = 0; i < data.length; i++) {
                    if (data[i]['r_class'] === r_class) {
                        let res = data[i]['price'] * ((((Date.parse(checkout)) - Date.parse(checkin))) / (60 * 60 * 24 * 1000));
                        resolve(res)
                    }
                }
            })
    })
}

const addRoomsOption = document.querySelector('#add-btn');
const changeBookingContainer = document.querySelector('.change-booking-content-container')

const checkBtn = document.querySelector('#check-availability-btn');
const formOptionsExisting = document.querySelectorAll('.existing-booking');


let acceptedRooms = [];
let globalAdditionalPrice;

checkBtn.addEventListener('click', async e => {
    acceptedRooms = [];
    let bookingPrices = [];


    const formOptions = document.querySelectorAll('.new-booking');

    console.log(formOptionsExisting.length, formOptions.length)
    //console.log(formOptions)

    let showAlert = false;

    await fetch('/roomcheck')
        .then(res => res.json())
        .then(data => data)


    for (let i = 0; i < formOptions.length; i++) {
        let price;
        await calcRate(formOptions[i].children[0].children[0].value, formOptions[i].children[0].children[1].value, formOptions[i].children[0].children[2].value).then(data => {
            bookingPrices.push(data)
            price = data
        })

        let message = {

            r_class: formOptions[i].children[0].children[0].value,

            checkin: formOptions[i].children[0].children[1].value,

            checkout: formOptions[i].children[0].children[2].value,

            price: price

        }

        if (message['checkout'] > message['checkin']) {
            let serialMessage = JSON.stringify(message)
            await fetch('/roomcheck', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: serialMessage
            })
                .then(res => res.json())
                .then(data => {
                    if (data['status'] === true) {
                        formOptions[i].style.backgroundColor = '#e6fff1d6';
                        acceptedRooms.push(data)
                    } else {
                        formOptions[i].style.backgroundColor = '#ffc8c8d6';
                    }
                })

        } else {
            alert('Please make sure your check-out date is later than your check-in date.')
        }
    }

    let totalPrice = bookingPrices.reduce((a, b) => a + b, 0)
    globalAdditionalPrice = totalPrice;

    const individualPriceDiv = document.querySelectorAll('.individual-price')
    for (let i = 0; i < formOptions.length; i++) {
        individualPriceDiv[i].innerHTML = `<p>£${bookingPrices[i]}</p>`
    }
    newPricesContainer.innerHTML = `Additional price: £${totalPrice}`
    if ((formOptionsExisting.length + formOptions.length) === (acceptedRooms.length + formOptionsExisting.length)) {
        confirmStatus = true;
    }
})

const confirmBtn = document.querySelector('#confirm-order-btn')

confirmBtn.addEventListener('click', async e => {
    if (confirmStatus === true) {
        let url = window.location.href;
        let bookRef;
        if (url.charAt(url.length - 5) === '/') {
            bookRef = parseInt(url.slice(-4))
        } else {
            bookRef = parseInt(url.slice(-5))
        }

        if (acceptedRooms.length > 0) {
            acceptedRooms.forEach(async room => {
                let message = {
                    b_ref: bookRef,
                    r_no: room['r_no'],
                    checkin: room['checkin'],
                    checkout: room['checkout'],
                }
                console.log(message)
                await fetch('/insertroomtodb', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(message)
                })
            })
        }
        let priceMessage = {
            additional: globalAdditionalPrice,
            b_ref: bookRef
        }

        await fetch('/updateoutstanding', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(priceMessage)
        })
            .then(res => res.json()).then(data => {
                data['state'] === true ? location.reload() : console.log(data)
            })

    } else {
        alert('Please check that your rooms are available before proceeding by clicking on the check room availability button')
    }
})

const printButton = document.querySelector('#print');
let originalPage = document.body.innerHTML;
let printConfirmationPage = document.querySelector('#print-confirmation-page').innerHTML;

printButton.addEventListener('click', async e => {
    document.body.innerHTML = printConfirmationPage;
    window.print();
    document.body.innerHTML = originalPage;
    window.location.reload()

})

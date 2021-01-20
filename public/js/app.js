// booking form switch

const enquireContent = document.querySelector('.room-container-options-enquire')
const bookingContent = document.querySelector('.room-container-options-booking');
const enquireButton = document.querySelector('.room-container-options-container-enquire');
const bookingButton = document.querySelector('.room-container-options-container-booking');

enquireButton.addEventListener('click', () => {
  bookingContent.style.display = 'none'
  enquireContent.style.display = 'flex'
  enquireButton.style.backgroundColor = '#ffffffd2'
  bookingButton.style.backgroundColor = '#808080d2'
  enquireButton.style.color = 'black'
  bookingButton.style.color = 'black'


})
bookingButton.addEventListener('click', () => {
  bookingContent.style.display = 'flex'
  enquireContent.style.display = 'none'
  enquireButton.style.backgroundColor = '#808080d2'
  bookingButton.style.backgroundColor = '#ffffffd2'
  enquireButton.style.color = 'black'
  bookingButton.style.color = 'black'

})

// Room information Tabs code
const roomDetailsNavItems = document.querySelectorAll('.container3-nav-bar-item');
const navItemsDetailsTab = document.querySelector('.container3-nav-bar-item-1');
const navItemsReviewsTab = document.querySelector('.container3-nav-bar-item-2')
const roomDetailsTabContent = document.querySelector('.container4-details-container');
const roomReviewsTabContent = document.querySelector('.container4-reviews-container');

roomDetailsNavItems.forEach((item) => {
  item.addEventListener('click', (e) => {
    if (e.target.textContent == 'Details') {
      roomDetailsTabContent.style.display = 'block';
      roomReviewsTabContent.style.display = 'none';
      navItemsDetailsTab.classList.add('item-active');
      navItemsReviewsTab.classList.remove('item-active');
    } else if (e.target.textContent == 'Reviews') {
      roomDetailsTabContent.style.display = 'none';
      roomReviewsTabContent.style.display = 'flex';
      navItemsDetailsTab.classList.remove('item-active');
      navItemsReviewsTab.classList.add('item-active');
    }
  })
});

// ************ client side node *****************

const bookingBtn = document.querySelector('.room-container-options-room-options-button-add');
const bookingOptionsContainer = document.querySelector('.form-room-options');
const checkBtn = document.querySelector('.room-container-booking-btn a')
const removeBtn = document.querySelector('.room-container-options-room-options-button-remove')
const proceedBtn = document.querySelector('#proceedtoBookingBtn')

let acceptedRooms = [];
let currentClientRooms = 1;
// function used to convert room name shortenings to their full name
function convertDataBack(input) {
  if (input === 'std_t') { return 'Standard Twin' }
  else if (input === 'std_d') { return 'Standard Double' }
  else if (input === 'sup_t') { return 'Superior Twin' }
  else if (input === 'sup_d') { return 'Superior Double' }
}

function displayRecommendations(roomsArray) {
  // Function used to convert data types and put them into an array.
  let remainingRoomTypes = []

  if (roomsArray[0]['std_t'] > 0) { remainingRoomTypes.push('Standard Twin') }
  if (roomsArray[0]['std_d'] > 0) { remainingRoomTypes.push('Standard Double') }
  if (roomsArray[0]['sup_t'] > 0) { remainingRoomTypes.push('Superior Twin') }
  if (roomsArray[0]['sup_d'] > 0) { remainingRoomTypes.push('Superior Double') }

  return remainingRoomTypes;
}

function addToPopup(popup, rejectedRoom, otherRoomsArray) {
  //Function to add room recommendations to the recommendation popup when room checks fail
  let sectionDiv = document.createElement('div');
  let rejectedRoomP = document.createElement('p');
  let recommendationsP = document.createElement('p');
  let r_class = rejectedRoom[0]['r_class'];
  let checkin = rejectedRoom[0]['checkin'];
  let checkout = rejectedRoom[0]['checkout'];

  if (rejectedRoom.length > 0) {

    sectionDiv.className = 'rejected-row'

    rejectedRoomP.textContent = `We don't have a ${convertDataBack(r_class)} available from ${checkin} to ${checkout}`;

    sectionDiv.appendChild(rejectedRoomP);

    let recommendations = displayRecommendations(otherRoomsArray)
    console.log(recommendations)
    if (recommendations.length > 0) {
      recommendationsP.innerHTML = 'Please choose one of the available room types: <br> '
    } else {
      recommendationsP.textContent = `Sorry we don't have any other room types available.`
    }


    recommendations.forEach(recommendation => {
      recommendationsP.innerHTML += recommendation + '<br>'
    })

    sectionDiv.appendChild(recommendationsP);

    popup.appendChild(sectionDiv)
  }
}

// function addToPopupPass() {
//   let acceptedDiv = document.createElement('div')
//   acceptedDiv.textContent = 'accepted all'
// }


function convertData(dataType, dataClass) {
  // convert data to DB format
  if (dataType === 'twin' && dataClass === 'standard') {
    return 'std_t'
  } else if (dataType === 'twin' && dataClass === 'superior') {
    return 'sup_t'
  } else if (dataType === 'double' && dataClass === 'standard') {
    return 'std_d'
  } else if (dataType === 'double' && dataClass === 'superior') {
    return 'sup_d'
  }
}

function submitLag(targ) {
  // Only allow the check button to be pressed once every 2 seconds to prevent database request overload
  targ.disabled = true;
  setTimeout(() => {
    targ.disabled = false;
  }, 2000)
}


bookingBtn.addEventListener('click', (e) => {
  // Add new room booking option container. Current rooms in client increased by every new room added
  currentClientRooms++;
  let div = document.createElement('div');
  div.classList.add('room-container-options-room-options');
  // For each time add room is pressed, a new div with room options is created
  div.innerHTML = `
  <div class="room-container-options-room-options-room-info">
      <div class="room-container-options-room-options-option">
          <label class='bold' for="room-type"> Room type </label>
          <select name="room-type" id="room-type">
          <option value="twin">Twin</option>
          <option value="double">Double</option>
          </select>
      </div> 
      <div class="room-container-options-room-options-option">
          <label class='bold' for="room-class"> Room class </label>
          <select name="room-class" id="room-class">
              <option value="standard">Standard</option>
              <option value="superior">Superior</option>
          </select>
      </div>
  </div>
  <div class="room-container-options-room-options-dates">
      <div class="room-container-options-checkin">
          <label class='bold' for="checkin"> Checkin date: </label>
          <input type="date" id='checkin' name='checkin' value='2018-10-09'>
      </div>
      <div class="room-container-options-checkout">
          <label class='bold' for="checkout"> Checkout date: </label>
          <input type="date" id='checkout' name='checkout' value = '2018-10-09'>
      </div>
  </div>
      <div class="remove-check-btn-container">
        <button onclick='removeBtnFunc(this)' type='button' class='room-container-options-room-options-button-remove' '>Remove</button>
      </div>
  </div>
  `
  bookingOptionsContainer.appendChild(div)
})

function removeBtnFunc(btn) {
  // Remove a room from the query list
  if (currentClientRooms > 1) {
    currentClientRooms--;
    btn.parentElement.parentElement.remove();
  }
}

const optionsContainer = document.querySelectorAll('.room-container-options-room-options');


const popupBtns = document.querySelectorAll('#info-button');
const popup = document.querySelector('.popup-overlay')
const popupContent = document.querySelector('.popup-content')
const formOptions = document.querySelector('.form-room-options');

function closePopup() {
  // Close room recommendation popup
  popup.classList.remove('popup-overlay-active');
}

checkBtn.addEventListener('click', async e => {
  // Main room availabiity checking process
  popupContent.innerHTML = ``;
  submitLag(e.target)
  acceptedRooms = [];
  let otherRoomsArray = [];
  let rejectedRoom = [];
  let showAlert = false;
  await fetch('/roomcheck')
    .then(res => res.json())
    .then(data => data)



  for (let i = 0; i < formOptions.children.length; i++) {
    // seperate fetch request sent for each room which allows already checked rooms to be included into the next check
    let message = {
      r_class: convertData(formOptions.children[i].childNodes[1].childNodes[1].childNodes[3].value, formOptions.children[i].childNodes[1].childNodes[3].childNodes[3].value),

      checkin: formOptions.children[i].childNodes[3].childNodes[1].childNodes[3].value,

      checkout: formOptions.children[i].childNodes[3].childNodes[3].childNodes[3].value
    }

    if (message['checkout'] > message['checkin']) {
      // Check that the checkout is greater than checkin
      let serialMessage = JSON.stringify(message);
      await fetch('/roomcheck', {
        // Send the individual room to be checked
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: serialMessage
      })
        .then(res => res.json())
        .then(data => {
          console.log(data)
          if (data['status'] === true && data['checkout'] > data['checkin']) {
            // If room check comes back as true, the room is pushed to the accepted rooms array
            acceptedRooms.push({
              r_no: data['r_no'],
              checkin: data['checkin'],
              checkout: data['checkout']
            })
            // Client side room is marked as green
            formOptions.children[i].style.backgroundColor = '#e6fff1d6'

          } else {
            // room check failed, client side room is marked as red
            formOptions.children[i].style.backgroundColor = '#ffc8c8d6'
            otherRoomsArray = [];
            rejectedRoom = [];
            // Rooms back refers to the recommended rooms sent back for the individually checked room
            otherRoomsArray.push(data['roomsBack'])
            // The rejected room information is sent back too, so that it can be included into the recommendations popup so that the user knows which room is not available and then cna see the recommendations for that room
            rejectedRoom.push(data['roomSent'])
            addToPopup(popupContent, rejectedRoom, otherRoomsArray)
          }
        })
        .catch(error => {
          console.log(error)
        })
    } else {
      showAlert = true;
    }
  }
  if (showAlert === true) {
    alert('Make sure that your checkout date is later than your checkin date! Check the boxes in white :)')
  }


  const popupBtn = document.querySelector('#info-button');

  popupBtn.addEventListener('click', e => {
    // activate popup button
    popup.classList.add('popup-overlay-active')
  })
}
)

proceedBtn.addEventListener('click', e => {
  // if all rooms are marked as available, then the user can move on to the booking payment details form.
  if (currentClientRooms === acceptedRooms.length) {
    window.location.href = '/booking'
  } else {
    alert('Please check that your rooms are available before proceeding by clicking on the check room availability button')
  }
})





















// test GET all users 
let changeRoomStatus;

function onJsonReady(json) {
	/*CREATE TABLE FOR ROOM DETAILS */
	const roomtable = document.querySelector('#roomtable');
	//total room number
	let total_room = json["data"].length;
	//create status options, forms and buttons.
	let statusOption = '<form> <select name="status" id="status" ><option>--Select--</option><option value="A">Available</option><option value="C">Checked Out</option><option value="X">Unavailable</option></select> <button class="btn btn-info btn-sm m-2" id="btn">Apply</button></form>';
	for (let i = 0; i < total_room; i++) {
		//create room table variable.
		let roomInfo = `<tr> <td>${json["data"][i]["r_no"]}</td> <td>${json["data"][i]["r_class"]}</td> <td>${json["data"][i]["price"]}</td> <td>${json["data"][i]["r_notes"]}</td> <td id="room-status">${json["data"][i]["r_status"]}</td><td>${statusOption}</td> </tr>`;
		//add every individual room information into innerHTML of website.
		roomtable.innerHTML += roomInfo
	}

	const btn = document.querySelectorAll('#btn');
	const status = document.querySelectorAll('#status');

	for (let i = 0; i < status.length; i++) {
		changeRoomStatus = [];
		btn[i].onclick = (e) => {
			e.preventDefault();
			const selectedValues = [].filter
				.call(status[i].options, option => option.selected)
				.map(option => option.value);
			changeRoomStatus = {
				r_no: json["data"][i]["r_no"],
				r_status: selectedValues
			}
			//post the new status value to database.
			const serializedMessage = JSON.stringify(changeRoomStatus);
			fetch('/updateStatus', {
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


	/*Change room status card numbers dynamically*/
	const roomStatus = document.querySelectorAll('#room-status');
	let available = 0;
	let checkout = 0;
	let unavailable = 0;
	for (let i = 0; i < roomStatus.length; i++) {
		if (roomStatus[i].innerText === 'A') {
			available++;
		} else if (roomStatus[i].innerText === 'C') {
			checkout++;
		} else if (roomStatus[i].innerText === 'X') {
			unavailable++;
		}
	}
	document.querySelector('#a-room').innerText = available;
	document.querySelector('#u-room').innerText = unavailable;
	document.querySelector('#c-room').innerText = checkout;
	/*Ending Change room status card dynamically*/

}


function onResponse(response) {
	return response.json()
}

fetch('/rooms')
	.then(onResponse)
	.then(onJsonReady);

// test POST /user 


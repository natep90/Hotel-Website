function onJsonReady(json) {
	const paymentTable = document.querySelector('#payment-table');
	let total_bookings = json["data"].length;
	let paymentAmount = '<form><input class = "mx-2" type="number" id="payment"></form>';
	let processButtons = '<form><button class="btn btn-info btn-sm" id="payment-btn">Take Payment</button><button class="btn btn-danger btn-sm m-2" id="payment-extra">Add Extra Costs</button></form>'
	//create payment table, buttons and inputs.
	for (let i = 0; i < total_bookings; i++) {
		let paymentInfo = `<tr><td>${json["data"][i]["b_ref"]}</td> <td>${json["data"][i]["c_name"]}</td> <td>${json["data"][i]["b_cost"]}</td> <td>${json["data"][i]["b_outstanding"]}</td><td>${paymentAmount}</td><td>${processButtons}</td></tr>`;
		paymentTable.innerHTML += paymentInfo
	}

	//Selecting buttons based on their instances start and number input area
	const payment_btn = document.querySelectorAll('#payment-btn');
	const extraBtn = document.querySelectorAll('#payment-extra');
	const payment = document.querySelectorAll('#payment');
	let amount = 0;
	let tCost = 0;
	//For loop checks all buttons instance.
	for (let i = 0; i < payment.length; i++) {
		processPayment = [];
		extraPayment = [];
		//ones button clicked get its instance
		payment_btn[i].onclick = (e) => {
			e.preventDefault();
			//get b_outstanding value on clicked button instance
			let b_outstanding = json["data"][i]["b_outstanding"]
			//get text area number input based on clicked button instance
			amount = payment[i].value;
			//If the b_outstanding is smaller than amount than give alert
			if (b_outstanding - amount < 0) {
				alert("Your Amount is Invalid!");
			}
			// Otherwise, code will work.
			else {
				//Amount can be minus or positive. If someone has payment then amount will be positive and decrease the b_outstanding.
				//If amount is negative, which means additional payment. This is for process payment.
				b_outstanding -= amount;
				processPayment = {
					b_ref: json["data"][i]["b_ref"],
					payment: b_outstanding
				}
				//send the new b_outstanding and also its reference to have some changes.
				const serializedMessage = JSON.stringify(processPayment);
				fetch('/processPayment', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: serializedMessage
				}
				)
			}

			window.location.reload()
		}
		//extra button for extra costs like food or drinks.
		extraBtn[i].onclick = (e) => {
			e.preventDefault();
			let b_outstanding = json["data"][i]["b_outstanding"]
			let b_cost = json["data"][i]["b_cost"];
			extraCost = payment[i].value;
			//I put this because float value comes from databse as decimal. Add the cost to b_cost for extras
			let extraTot = (parseFloat(b_cost) + parseFloat(extraCost)).toFixed(2);
			let amountTot = (parseFloat(b_outstanding) + parseFloat(extraCost)).toFixed(2);
			//Extra cost cannot be negative
			if (extraCost < 0) {
				alert("Your Amount is Invalid. Value must be positive!");
			} else {
				extraPayment = {
					b_ref: json["data"][i]["b_ref"],
					extra: extraTot,
					cost: amountTot
				}
				//send updated b_cost as post request.
				const serializedMessage = JSON.stringify(extraPayment);
				fetch('/extraPayment', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: serializedMessage
				}
				)
			}
			//refresh the screen to see new values
			window.location.reload()
		}

	}
	//Selecting buttons based on their instances ends.

	/*Change room payment card dynamically*/
	let totalCost = 0;
	let amountOut = 0;
	let income = 0;

	for (let i = 0; i < payment.length; i++) {
		totalCost += parseFloat(json["data"][i]["b_cost"]);
		amountOut += parseFloat(json["data"][i]["b_outstanding"]);
	}
	income = totalCost - amountOut;
	document.querySelector('#total-cost').innerText = parseInt(totalCost);
	document.querySelector('#amount-out').innerText = parseInt(amountOut);
	document.querySelector('#total-income').innerText = parseInt(income);
	/*Ending Change room payment card dynamically*/

}

function onResponse(response) {
	return response.json()
}


fetch('/admin')
	.then(onResponse)
	.then(onJsonReady)




// test POST /user 



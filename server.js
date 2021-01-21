const env = process.env.NODE_ENV || 'production';

const config = require('./config.js')[env];

const express = require('express');
const app = express();
const pg = require('pg');
const { body, validationResult } = require('express-validator');

const ejs = require('ejs')
const bodyParser = require('body-parser');
const { json } = require('body-parser');
const jsonParser = bodyParser.json();
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.json())


// Index.ejs route for HTML link to homepage. Database query will fetch current room prices and display them dynamically using EJS 
app.get('/index', async (req, res) => {
    const pool = new pg.Pool(config);
    const client = await pool.connect();
    const PSQL = `
    SET SEARCH_PATH TO hotelbooking;

    SELECT * FROM rates;
    `
    await client.query(PSQL).then(results => {
        let prices = {
            std_t: 0,
            std_d: 0,
            sup_t: 0,
            sup_d: 0
        }

        results[1].rows.forEach(row => {
            if (row['r_class'] === 'std_t') { prices['std_t'] = row['price'] }
            else if (row['r_class'] === 'std_d') { prices['std_d'] = row['price'] }
            else if (row['r_class'] === 'sup_d') { prices['sup_d'] = row['price'] }
            else if (row['r_class'] === 'sup_t') { prices['sup_t'] = row['price'] }
        })

        res.render('pages/index', { rate: prices })
    })
})
// homepage route for HTML link to homepage. Database query will fetch current room prices and display them dynamically using EJS 
app.get('/', async (req, res) => {
    const pool = new pg.Pool(config);
    const client = await pool.connect();
    const PSQL = `
    SET SEARCH_PATH TO hotelbooking;

    SELECT * FROM rates;
    `
    await client.query(PSQL).then(results => {
        let prices = {
            std_t: 0,
            std_d: 0,
            sup_t: 0,
            sup_d: 0
        }

        results[1].rows.forEach(row => {
            if (row['r_class'] === 'std_t') { prices['std_t'] = row['price'] }
            else if (row['r_class'] === 'std_d') { prices['std_d'] = row['price'] }
            else if (row['r_class'] === 'sup_d') { prices['sup_d'] = row['price'] }
            else if (row['r_class'] === 'sup_t') { prices['sup_t'] = row['price'] }
        })

        res.render('pages/index', { rate: prices })
    })
})
// EJS admin page route
app.get('/adminpage', (req, res) => {
    res.render('pages/admin')
})


// GET request for all room rates
app.get('/room', async (req, res) => {

    const pool = new pg.Pool(config);
    const client = await pool.connect();
    const PSQL = `
    SET SEARCH_PATH TO hotelbooking;

    SELECT * FROM rates;
    `
    await client.query(PSQL).then(results => {

        let prices = {
            std_t: 0,
            std_d: 0,
            sup_t: 0,
            sup_d: 0
        }

        results[1].rows.forEach(row => {
            if (row['r_class'] === 'std_t') { prices['std_t'] = row['price'] }
            else if (row['r_class'] === 'std_d') { prices['std_d'] = row['price'] }
            else if (row['r_class'] === 'sup_d') { prices['sup_d'] = row['price'] }
            else if (row['r_class'] === 'sup_t') { prices['sup_t'] = row['price'] }
        })

        res.render('pages/room', { rate: prices })
    })



})
// Serve up the booking form page
app.get('/booking', (req, res) => {
    res.render('pages/booking')
})


// admin routes 
app.get('/rooms', async (req, res) => {

    let results;
    const pool = new pg.Pool(config);
    const client = await pool.connect();
    let data;
    const q = 'SET SEARCH_PATH TO hotelbooking; SELECT * FROM room JOIN rates ON rates.r_class = room.r_class ORDER BY r_no ASC;'

    await client.query(q).then(results => {
        client.release();
        // get the results from the second query
        data = results[1].rows;
        res.json({ data });
    }).catch(err => {
        console.log(err.stack)
        errors = err.stack.split(" at ");
        res.json({ message: 'Sorry something went wrong! The data has not been processed ' + errors[0] });
    });

});


app.post('/updateStatus', jsonParser, async (req, res) => {

    const roomNumber = req.body.r_no;
    const roomStatus = req.body.r_status;

    const pool = new pg.Pool(config);
    const client = await pool.connect();
    let data;
    const q = `SET SEARCH_PATH TO hotelbooking; UPDATE room SET r_status = '${roomStatus[0]}' WHERE r_no = ${roomNumber};`;
    await client.query(q).then(results => {
        client.release();
        // get the results from the second query
        data = results[1].rows;
        res.json({ data });

    }).catch(err => {
        console.log(err.stack)
        errors = err.stack.split(" at ");
        res.json({ message: 'Sorry something went wrong! The data has not been processed ' + errors[0] });
    });



});

app.get('/admin', async (req, res) => {

    let results;
    const pool = new pg.Pool(config);
    const client = await pool.connect();
    let data;
    const q = 'SET SEARCH_PATH TO hotelbooking; SELECT b_ref, c_name, b_cost, b_outstanding FROM booking JOIN customer ON booking.c_no=customer.c_no ORDER BY booking.b_ref ASC;'
    await client.query(q).then(results => {
        client.release();

        data = results[1].rows;
        res.json({ data });
    }).catch(err => {
        console.log(err.stack)
        errors = err.stack.split(" at ");
        res.json({ message: 'Sorry something went wrong! The data has not been processed ' + errors[0] });
    });

});

app.post('/processPayment', jsonParser, async (req, res) => {

    const bookingNumber = req.body.b_ref;
    const payment = req.body.payment;

    const pool = new pg.Pool(config);
    const client = await pool.connect();
    let data;
    const q = `SET SEARCH_PATH TO hotelbooking; 
    UPDATE booking SET b_outstanding = ${payment} WHERE b_ref=${bookingNumber};`;
    await client.query(q).then(results => {
        client.release();

        data = results[1].rows;
        res.json({ data });

    }).catch(err => {
        console.log(err.stack)
        errors = err.stack.split(" at ");
        res.json({ message: 'Sorry something went wrong! The data has not been processed ' + errors[0] });
    });

});

app.post('/extraPayment', jsonParser, async (req, res) => {

    const bookingNumber = req.body.b_ref;
    const extra = req.body.extra;
    const b_out = req.body.cost;

    const pool = new pg.Pool(config);
    const client = await pool.connect();
    console.log('')
    let data;
    const q = `SET SEARCH_PATH TO hotelbooking; 
    UPDATE booking SET b_cost = ${extra}, b_outstanding = ${b_out} WHERE b_ref=${bookingNumber};`;
    await client.query(q).then(results => {
        client.release();

        data = results[1].rows;
        res.json({ data });

    }).catch(err => {
        console.log(err.stack)
        errors = err.stack.split(" at ");
        res.json({ message: 'Sorry something went wrong! The data has not been processed ' + errors[0] });
    });

});

app.get('/roomprices', async (req, res) => {

    let results;
    const pool = new pg.Pool(config);
    const client = await pool.connect();
    let data;
    const q = 'SET SEARCH_PATH TO hotelbooking; SELECT * FROM rates ORDER BY r_class ASC;'
    await client.query(q).then(results => {
        client.release();

        data = results[1].rows;
        res.json({ data });
    }).catch(err => {
        console.log(err.stack)
        errors = err.stack.split(" at ");
        res.json({ message: 'Sorry something went wrong! The data has not been processed ' + errors[0] });
    });

});

app.post('/changePrice', jsonParser, async (req, res) => {

    const rclass = req.body.r_class;
    const new_price = req.body.price;

    const pool = new pg.Pool(config);
    const client = await pool.connect();
    let data;
    const q = `SET SEARCH_PATH TO hotelbooking; 
    UPDATE rates SET price = ${new_price} WHERE r_class='${rclass}';`;
    await client.query(q).then(results => {
        client.release();

        data = results[1].rows;
        res.json({ data });

    }).catch(err => {
        console.log(err.stack)
        errors = err.stack.split(" at ");
        res.json({ message: 'Sorry something went wrong! The data has not been processed ' + errors[0] });
    });

});


// Serve up booking confirmation based on the booking ID
app.get('/confirmation/:id', jsonParser, async (req, res) => {
    const pool = new pg.Pool(config);
    const client = await pool.connect();
    const PSQL = `
    SET SEARCH_PATH TO hotelbooking;

    SELECT * FROM booking WHERE b_ref = ${req.params['id']};

    SELECT * FROM roombooking WHERE b_ref = ${req.params['id']};

    SELECT booking.c_no, booking.b_ref, customer.c_name
    FROM booking
    LEFT JOIN customer ON booking.c_no = customer.c_no
    WHERE booking.b_ref = ${req.params['id']};

    SELECT * FROM room;
    `

    await client.query(PSQL).then(results => {
        let c_name = results[3].rows[0].c_name
        let cost = results[1].rows[0]['b_cost']
        let bookings = results[2].rows
        let r_no = []
        let checkin = []
        let checkout = []
        let b_ref = results[2].rows[0].b_ref
        let allRoomsArray = results[4].rows
        let roomTypes = [];


        // Select the current booking information relating the the imported booking reference. For each room, it is pushed to an array of rooms that the user has booked
        for (let i = 0; i < bookings.length; i++) {
            r_no.push(bookings[i]['r_no'])
            checkin.push(JSON.stringify(bookings[i]['checkin']).slice(1, 11))
            checkout.push(JSON.stringify(bookings[i]['checkout']).slice(1, 11))
        }

        // Now the room types are identified from the booked rooms and placed into an array
        for (let i = 0; i < allRoomsArray.length; i++) {
            for (let j = 0; j < r_no.length; j++) {
                if (allRoomsArray[i]['r_no'] === r_no[j]) {
                    roomTypes.push(allRoomsArray[i]['r_class'])
                }
            }
        }

        // all booking information is sent back to the confirmation page to be displayed to the user
        res.render('pages/confirmation', { name: c_name, cost: cost, r_no: r_no, checkin: checkin, checkout: checkout, b_ref: b_ref, roomTypes: roomTypes })
    })

})

app.get('/currentbooking', jsonParser, async (req, res) => {

    // get the booking details of the rooms that are currently being booked
    const pool = new pg.Pool(config);
    const client = await pool.connect();
    const PSQL = `
    SET SEARCH_PATH TO hotelbooking;

    SELECT * FROM querybooking;
    `
    await client.query(PSQL).then(results => {
        res.json(results[1].rows)
    })


})
// Room availability check
app.post('/roomcheck', jsonParser, async (request, response) => {
    const pool = new pg.Pool(config);
    const client = await pool.connect();
    const PSQL = `
    SET SEARCH_PATH TO hotelbooking;

    CREATE TABLE IF NOT EXISTS querybooking (
        r_no integer not null,
        r_class char(5) not null,
        checkin date not null,
        checkout date not null
    );

    SELECT r_no FROM room WHERE r_class = '${request.body['r_class']}';

    SELECT room.r_no, checkin, checkout FROM roombooking
    LEFT JOIN room ON room.r_no = roombooking.r_no
    WHERE r_class = '${request.body['r_class']}'
    AND checkin <= '${JSON.stringify(request.body['checkout'])}'::date 
    AND checkout >= '${JSON.stringify(request.body['checkin'])}'::date;

    SELECT * FROM querybooking WHERE r_class = '${request.body['r_class']}'
    AND checkin <= '${JSON.stringify(request.body['checkout'])}'::date 
    AND checkout >= '${JSON.stringify(request.body['checkin'])}'::date;

    SELECT room.r_no, room.r_class FROM roombooking
    LEFT JOIN room ON room.r_no = roombooking.r_no
    WHERE roombooking.checkin <= '${JSON.stringify(request.body['checkout'])}'::date 
    AND roombooking.checkout >= '${JSON.stringify(request.body['checkin'])}'::date
    GROUP BY room.r_no
    ORDER BY room.r_no;

    SELECT r_no, r_class FROM room;  
    `

    let booking = []
    let bookedRooms = {
        std_t: 0,
        std_d: 0,
        sup_t: 0,
        sup_d: 0
    };
    let bookedRoomsCount = {
        std_t: 0,
        std_d: 0,
        sup_t: 0,
        sup_d: 0
    }
    let totalRoomNumbers = {
        std_t: 0,
        std_d: 0,
        sup_t: 0,
        sup_d: 0
    }
    let room = request.body

    await client.query(PSQL).then(results => {
        client.release();
        let otherRooms = results[5].rows
        let roomList = results[6].rows
        let bookedRoomsQuery = results[4].rows
        // get the number of each room type in the hotel and put them into a dictionary
        for (let i = 0; i < roomList.length; i++) {
            if (roomList[i]['r_class'] === 'std_t') {
                totalRoomNumbers['std_t']++
            } else if (roomList[i]['r_class'] === 'std_d') {
                totalRoomNumbers['std_d']++
            } else if (roomList[i]['r_class'] === 'sup_t') {
                totalRoomNumbers['sup_t']++
            } else if (roomList[i]['r_class'] === 'sup_d') {
                totalRoomNumbers['sup_d']++
            }
        }
        // This searches the database for rooms that match the current room that is being checked. Each unique room type found within the same dates are added to an overall occupied room count dictionary
        for (let i = 0; i < otherRooms.length; i++) {
            if (otherRooms[i]['r_class'] === 'std_t') {
                bookedRoomsCount['std_t']++
            } else if (otherRooms[i]['r_class'] === 'std_d') {
                bookedRoomsCount['std_d']++
            } else if (otherRooms[i]['r_class'] === 'sup_t') {
                bookedRoomsCount['sup_t']++
            } else if (otherRooms[i]['r_class'] === 'sup_d') {
                bookedRoomsCount['sup_d']++
            }
        }

        for (let i = 0; i < bookedRoomsQuery.length; i++) {
            if (bookedRoomsQuery[i]['r_class'] === 'std_t') {
                bookedRoomsCount['std_t']++
            } else if (bookedRoomsQuery[i]['r_class'] === 'std_d') {
                bookedRoomsCount['std_d']++
            } else if (bookedRoomsQuery[i]['r_class'] === 'sup_t') {
                bookedRoomsCount['sup_t']++
            } else if (bookedRoomsQuery[i]['r_class'] === 'sup_d') {
                bookedRoomsCount['sup_d']++
            }
        }

        let matchedRoomsRoomBooking = results[3].rows
        let allRooms = results[2].rows
        let queryBookingRooms = results[4].rows

        let unavailableRooms = []
        let allRoomNumbers = []
        // push rooms that match the user query to an array
        for (let i = 0; i < allRooms.length; i++) {
            for (let j = 0; j < matchedRoomsRoomBooking.length; j++) {
                if (matchedRoomsRoomBooking[j]['r_no'] === allRooms[i]['r_no']) {
                    unavailableRooms.push(matchedRoomsRoomBooking[j]['r_no'])
                }
            }
        }
        // This includes the previously checked rooms into the unavailable room list, meaning that if a user checkes multiple rooms, each check will include the previously checked rooms to prevent overbooking
        for (let i = 0; i < allRooms.length; i++) {
            for (let j = 0; j < queryBookingRooms.length; j++) {
                if (queryBookingRooms[j]['r_no'] === allRooms[i]['r_no']) {
                    unavailableRooms.push(queryBookingRooms[j]['r_no'])
                }
            }
        }
        // array of all room numbers by room type
        for (let i = 0; i < allRooms.length; i++) {
            allRoomNumbers.push(allRooms[i]['r_no'])
        }

        // compare the total room number for each type of room in the hotel to the unavailable room numbers. The array is filtered to only include rooms numbers that are available.
        allRoomNumbers = allRoomNumbers.filter(val => !unavailableRooms.includes(val))

        // prepare a dictionary which will include an available room number based for a successful check and send it to an array which will include one room if successful. A random room number of the available room numbers is assigned
        let temp = {
            r_no: allRoomNumbers[Math.floor(Math.random() * allRoomNumbers.length)],
            r_class: request.body['r_class'],
            checkin: request.body['checkin'],
            checkout: request.body['checkout']
        }
        if (allRoomNumbers.length > 0) {
            booking.push(temp)
        }

    })
        .catch(err => {
            errors = err.stack.split(" at ");
            response.json({ message: 'Sorry something went wrong! The data has not been processed ' + errors[0] });
        });

    // If the booking array contains a room, this means that the check was passed.
    if (booking.length > 0) {
        // Now insert the successful room into the database from the booking array
        for (let i = 0; i < booking.length; i++) {
            await client.query(
                `INSERT INTO querybooking (r_no, r_class, checkin, checkout) 
                VALUES (${booking[i]['r_no']}, '${booking[i]['r_class']}', '${booking[i]['checkin']}', '${(booking[i]['checkout'])}');
                `
            ).then(results => {

            })
                .catch(err => {
                    errors = err.stack.split(" at ");
                    response.json({ message: 'Sorry something went wrong! The data has not been processed ' + errors[0] });
                });
        }
        // Now send back the successful room with a true status, indicating that the query passed the check. This whole process is done on a loop for each room being checked on the client side.
        response.json({
            status: true,
            r_no: booking[0]['r_no'],
            checkin: booking[0]['checkin'],
            checkout: booking[0]['checkout']
        })

    } else {
        // booking length is not > 1 meaning that there were no rooms available. This means that the check has failed.
        // In order to recommend other rooms, if the total number of booked rooms by room type is equal to the total number of rooms by room type in the hotel, no rooms of that type are available and false is sent back for that room type. If the booked rooms is less than the total rooms, that means that there are rooms available, so true is sent back.
        message = {
            std_t: bookedRoomsCount['std_t'] >= totalRoomNumbers['std_t'] ? false : true,
            std_d: bookedRoomsCount['std_d'] >= totalRoomNumbers['std_d'] ? false : true,
            sup_t: bookedRoomsCount['sup_t'] >= totalRoomNumbers['sup_t'] ? false : true,
            sup_d: bookedRoomsCount['sup_d'] >= totalRoomNumbers['sup_d'] ? false : true,
        }
        response.json({
            status: false,
            roomsBack: message,
            roomSent: room
        })
    }
})

app.post('/updateoutstanding', async (req, res) => {
    const pool = new pg.Pool(config);
    const client = await pool.connect();
    let PSQL = `
    SET SEARCH_PATH TO hotelbooking;
    UPDATE booking
    SET b_cost = b_cost + ${req.body['additional']},
        b_outstanding = b_outstanding + ${req.body['additional']}
    WHERE b_ref = ${req.body['b_ref']};
    `
    await client.query(PSQL).then(results => {
        client.release();
        res.json({
            state: true
        })
    })
        .catch(err => {
            errors = err.stack.split(" at ");
            res.json({ message: 'Sorry something went wrong! The data has not been processed ' + errors[0] });
        });
})

app.get('/roomcheck', async (request, response) => {
    // clears the temp booking table
    const pool = new pg.Pool(config);
    const client = await pool.connect();
    let PSQL = `
    SET SEARCH_PATH TO hotelbooking;
    TRUNCATE TABLE querybooking;
    `
    await client.query(PSQL).then(results => {
        client.release();

        resp = results[1].rows

        response.json(resp);
    })
        .catch(err => {
            errors = err.stack.split(" at ");
            response.json({ message: 'Sorry something went wrong! The data has not been processed ' + errors[0] });
        });
})

app.get('/getroomrates', async (req, res) => {
    // Method to get current room rates
    const pool = new pg.Pool(config);
    const client = await pool.connect();
    let PSQL = `
    SET SEARCH_PATH TO hotelbooking;

    SELECT * FROM rates
    `
    await client.query(PSQL).then(results => {
        res.json(results[1].rows)
    })

})

app.get('/clearcurrentbooking', async (req, res) => {
    const pool = new pg.Pool(config);
    const client = await pool.connect();
    let PSQL = `
    SET SEARCH_PATH TO hotelbooking;
    TRUNCATE TABLE querybooking;
    `
    await client.query(PSQL).then(results => {

    })
        .catch(err => {
            errors = err.stack.split(" at ");
            response.json({ message: 'Sorry something went wrong! The data has not been processed ' + errors[0] });
        });
})

// Algorithm adapted from: https://www.tutorialspoint.com/how-to-exclude-certain-values-from-randomly-generated-array-javascript

// Generate a random number function that excludes certain numbers
const generateRandom = (len, absentArray) => {
    const randomArray = [];
    for (let i = 0; i < len;) {
        const random = Math.floor(Math.random() * 10000);
        if (!absentArray.includes(random) &&
            !randomArray.includes(random)) {
            randomArray.push(random);
            i++;
        }
    };
    return randomArray[Math.floor(Math.random() * randomArray.length)];
}
// using the above function, a booking is created
app.post('/makebooking', async (req, res) => {
    const pool = new pg.Pool(config);
    const client = await pool.connect();

    let body = req.body

    let PSQL = `
    SET SEARCH_PATH TO hotelbooking;
    SELECT c_no FROM customer;
    SELECT b_ref FROM booking; 
    `
    let customerNo;
    let bookingNo;
    await client.query(PSQL).then(results => {
        client.release()
        //current customer numbers that exist
        let currentNos = [];
        for (let i = 0; i < results[1].rows.length; i++) {
            currentNos.push(results[1].rows[i])
        }

        const len = 10000;
        customerNo = generateRandom(len, currentNos)

        // GET BOOKING REF THAT EXIST
        //current booking numbers
        let currentBookingRefs = []
        for (let i = 0; i < results[2].rows.length; i++) {
            currentBookingRefs.push(results[2].rows[i])
        }
        //generate random numbers to assign for booking ref and customer num
        bookingNo = generateRandom(len, currentBookingRefs)

    })
        .catch(err => {
            errors = err.stack.split(" at ");
            res.json({ message: 'Sorry something went wrong! The data has not been processed ' + errors[0] });
        });

    const roomInfo = req.body.room
    // booking is inserted into the database
    let PSQL2 = `
    SET SEARCH_PATH TO hotelbooking;
    INSERT INTO customer (c_no, c_name, c_email, c_address, c_cardtype, c_cardexp, c_cardno) 
    VALUES (
        '${customerNo}',
        '${body['name']}',
        '${body['email']}',
        '${body['address']}',
        '${body['cardtype']}',
        '${body['cardexp']}', 
        '${body['cardno']}'
    );
    INSERT INTO booking (b_ref, c_no, b_cost, b_outstanding, b_notes)
    VALUES (
        ${bookingNo},
        ${customerNo},
        ${req.body['bookingprice']},
        ${req.body['bookingprice']},
        ' '
    );
    `

    await client.query(PSQL2).then(results => {
    })

    // for each successful booking, they are inserted into the database on a loop, each room being givne a unique room number and rooking reference.

    for (let i = 0; i < roomInfo.length; i++) {
        await client.query(
            `INSERT INTO roombooking (r_no, b_ref, checkin, checkout) VALUES ($1,$2,$3,$4)`, [
            roomInfo[i]['r_no'],
            bookingNo,
            roomInfo[i]['checkin'],
            roomInfo[i]['checkout']
        ]
        )
    }
    res.json({
        c_no: customerNo,
        b_ref: bookingNo
    })

})
// insert a specific room into the database
app.post('/insertroomtodb', jsonParser, async (req, res) => {
    const pool = new pg.Pool(config);
    const client = await pool.connect();

    let b_ref = req.body['b_ref'];
    let r_no = req.body['r_no'];
    let checkin = req.body['checkin'];
    let checkout = req.body['checkout']

    let PSQL = `
    SET SEARCH_PATH TO hotelbooking;

    INSERT INTO roombooking VALUES (${r_no}, ${b_ref}, '${checkin}', '${checkout}')
    `;

    await client.query(PSQL).then(results => {
        res.json({
            state: true
        })
    })
})

app.listen(process.env.PORT, '0.0.0.0');


// Prevent forms from submitting and reloading the page
$("form").submit(function(e){e.preventDefault();});

// Set the contract address
var contractAddress = '0x3E48154A4096c12473e2dBe756bC3eD6c9698cA1';
// Set the relative URI of the contract’s skeleton (with ABI)
var contractJSON = "build/contracts/BitMathGame.json"
// Set the sending address
var senderAddress = '0x0';
// Set contract ABI and the contract
var contract = null;

$(window).on('load', function() {
  initialise(contractAddress);
});

// Asynchronous function (to work with modules loaded on the go)
// For further info: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/async_function
async function initialise(contractAddress) {
  // Initialisation of Web3
	if (typeof web3 !== 'undefined') {
	  web3 = new Web3(web3.currentProvider);
	} else {
	  // Set the provider you want from Web3.providers
    // Use the WebSocketProvider to enable events subscription.
	  web3 = new Web3(new Web3.providers.WebsocketProvider("ws://localhost:7545"));
	}

  // Load the ABI. We await the loading is done through "await"
  // More on the await operator: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await
  await $.getJSON(contractJSON,
    function( contractData ) { // Use of IIFEs: https://developer.mozilla.org/en-US/docs/Glossary/IIFE
      // console.log(contractAbi);
      contract = new web3.eth.Contract(contractData.abi, contractAddress);
    }
  ).catch((error) => { console.error(error); });
  // Arrow funcction expression at work. For further info: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions

  if (!contract) {
    console.error("No contract loaded.");
    return false;
  }

	// Set the address from which transactions are sent
	accounts = await web3.eth.getAccounts();
  console.log(accounts[0])
  senderAddress = accounts[0]
  console.log("Sender address set: " + senderAddress)

	// Subscribe to all events by the contract
	contract.events.allEvents(
    callback=function(error, event){ // A "function object". Explained here: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions#The_function_expression_(function_expression)
      if (error) {
        console.error(error)
      }
      console.log(event);
  });

	// Create additional event listeners to display the results of a play.
	subscribeToEvents();

	// Update the information displayed
	updateDisplayedInformation();
}

function updateDisplayedInformation() {
	checkBalance();
	checkProblem();
	displayMinter();
	displayAccountAddress();
	return false;
}

// Function to be called to play
function play() {
	var givenGuess = $('#guessinput').val();
	// Check that the value is a positive integer
	if (givenGuess < 1) {
		alert("The given guess should be higher than 0");
		return false;
	}
	// Add the log entry on the console
	console.log("Provided guess is: " + givenGuess);

	contract.methods.play(givenGuess).call({from:senderAddress, gas: 120000}).then(function(result) { // A promise in action
      console.log("Guess sent: " + givenGuess);
  })
  // Notice that call(…) has no side effect on the real contract, whereas send(…) does have a side-effect on the contract state
  contract.methods.play(givenGuess).send({from:senderAddress, gas: 120000}).on('receipt', function(receipt){
      console.log("Tx Hash of play(): " + receipt.transactionHash);
  });

	return false;
}

// Updates the problem
function checkProblem() {
  contract.methods.problem().call({from:senderAddress, gas: 120000}).then(function(result) { // A promise in action
      $("#problem").html(result);
  }).catch((error) => { console.error(error); });
  // The “send” method is not required here as it is a view on a public attribute of the contract.
  // Therefore, no state change is necessary on the contract and the sole call() suffices.
  // contract.methods.problem().send({from:senderAddress, gas: 120000}).on('receipt', function(receipt){
  //   console.log("Tx Hash of checkProblem(): " + receipt.transactionHash);
  // });
}

// Updates the balance
function checkBalance() {
  contract.methods.balance(senderAddress).call({from:senderAddress, gas: 120000}).then(function(result) { // A promise in action
      $("#mybalance").html(result);
  }).catch((error) => { console.error(error); });
  //  // The “send” method is not required here as it is a view on a public attribute of the contract.
  //  // Therefore, no state change is necessary on the contract and the sole call() suffices.
  //  contract.methods.balance(senderAddress).send({from:senderAddress, gas: 120000}).on('receipt', function(receipt){
  //      console.log("Tx Hash of checkBalance(): " + receipt.transactionHash);
  //  });
  web3.eth.getBalance(senderAddress).then(function(result) {
    $("#myweibalance").html(result);
  });
}

// Displays the account address
function displayAccountAddress() {
	$("#myaccountaddress").html(
		senderAddress
	);
}

// Displays the current minter address
function displayMinter() {
  contract.methods.minter().call({from:senderAddress, gas: 120000}).then(function(result) { // A promise in action
      $("#currentminter").html(result);
  });
  //  // The “send” method is not required here as it is a view on a public attribute of the contract.
  //  // Therefore, no state change is necessary on the contract and the sole call() suffices.
  //  contract.methods.minter().send({from:senderAddress, gas: 120000}).on('receipt', function(receipt){
  //    console.log("Tx Hash of displayMinter(): " + receipt.transactionHash);
  //  });
}

// Creates a subscription to specific events
function subscribeToEvents() {
  contract.events.Win( // Subscribe to all Win events
    function(error, event){
			if (!error) {
				// If the player is you, and this is a Win event…
				if (event.returnValues["winner"] == senderAddress) {
					$("#result").html("You win!");
				}
				updateDisplayedInformation();
			}
		}
  );
	contract.events.NextTime( // Subscribe to all NextTime events
		// Only "NextTime" events are captured here and passed to the callback
		function(error, event){
			if (!error) {
				// If the player is you, and this is a NextTime event…
				if (event.returnValues["player"] == senderAddress) {
					$("#result").html("You lose!");
				}
				updateDisplayedInformation();
			}
		}
	);
	contract.events.Mint( // Subscribe to all Mint events
		function(error, event){
			// Only "Minter" events are captured here and passed to the callback
			if (!error) {
				// If the player is you, and this is a Minter event…
				if (event.returnValues["minter"] == senderAddress) {
					$("#result").html("You win! Perfect!");
				}
				updateDisplayedInformation();
			}
		}
	);
}

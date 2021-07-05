Moralis.initialize("TAXZpkfV4FbCnoY592sUJuCXak26hdgBxUz5oqqU");
Moralis.serverURL = "https://mtpbh2zhvqjd.moralis.io:2053/server";

async function login() {
    try {
        user = await Moralis.User.current();
        if (!user) {
            user = await Moralis.Web3.authenticate();
        }
        document.getElementById("game").style.display = "block";
        document.getElementById("login_button").style.display = "none";
        document.getElementById("logout_button").style.display = "block";

    } catch (error) {
        console.log(error);
    }
}


async function logout() {
    try {
        await Moralis.User.logOut();
        console.log("logout done");
        await main();
    } catch (error) {
        console.log(error);
    }
}


async function main() {
    user = await Moralis.User.current();
    if (!user) {
        document.getElementById("login_button").style.display = "block";
        document.getElementById("logout_button").style.display = "none";
        // document.getElementById("address_info").style.display = "none";
    } else {
        document.getElementById("game").style.display = "block";
        document.getElementById("login_button").style.display = "none";
        document.getElementById("logout_button").style.display = "block";
        // document.getElementById("address_info").style.display = "block";
    }
    document.getElementById("game_result").style.display = "none";

    get_account_balance();
    refresh_balance();
    get_stats();
}

async function get_account_balance(){
    window.web3 = await Moralis.Web3.enable();
    document.getElementById("current_address").innerHTML = ethereum.selectedAddress;
    let balance = await web3.eth.getBalance(ethereum.selectedAddress);
    document.getElementById("current_address_balance")
    .innerHTML = balance +" WEI   " + web3.utils.fromWei(balance, 'ether') + " ETH";
}

async function refresh_balance(){
    window.web3 = await Moralis.Web3.enable();
    let balance = await web3.eth.getBalance(
        "0xa7c8ddf41ac11a82dc959bb7999c6831e08d7c15");
    document.getElementById("contract_balance").value = balance;
}

function add_row(table_id, data){
    let row = document.createElement('tr');
    data.forEach(element => {
        let col = document.createElement('td');
        col.innerHTML = element;
        row.appendChild(col);
    });
    document.getElementById(table_id).appendChild(row);
}

async function get_stats(){
    let top_bets = await Moralis.Cloud.run("top_bets", {});
    let top_winners = await Moralis.Cloud.run("top_winners", {});
    let top_losers = await Moralis.Cloud.run("top_losers", {});
    user = await Moralis.User.current();
    if (user){
        my_last_10_bets_ = await Moralis.Cloud.run("my_last_10_bets", {});
    } else {
        my_last_10_bets_ = [];
    }
    let last_10_bets = await Moralis.Cloud.run("last_10_bets", {});

    top_bets.forEach(e => {
        add_row("top_10_bets", [e.user, e.createdAt, e.side, e.bet, e.win]);
    });

    last_10_bets.forEach(a => {
        let e = a.attributes;
        add_row("last_10_bets", [e.user, e.createdAt, e.side, e.bet, e.win]);
    });
    if (user){
        my_last_10_bets_.forEach(a => {
            let e = a.attributes;
            add_row("my_last_10_bets", [e.user, e.createdAt, e.side, e.bet, e.win]);
        });
    }

    top_winners.forEach(e => {
        add_row("top_10_winners", [e.objectId, e.total_sum]);
    });

    top_losers.forEach(e => {
        add_row("top_10_losers", [e.objectId, e.total_sum]);
    });
}

async function fund(){
    amount = document.getElementById("fund_number").value;
    window.web3 = await Moralis.Web3.enable();
    let contract_instance = new web3.eth.Contract(
        abi, "0xa7c8ddf41ac11a82dc959bb7999c6831e08d7c15");
    await contract_instance.methods.fundContract()
        .send({ value: amount, from: ethereum.selectedAddress });
}

async function flip(side, side_str) {
    amount = document.getElementById("flip_number").value;
    window.web3 = await Moralis.Web3.enable();
    let contract_instance = new web3.eth.Contract(
        abi, "0xa7c8ddf41ac11a82dc959bb7999c6831e08d7c15");
    contract_instance.methods.flip(side).send({ value: amount, from: ethereum.selectedAddress })
        .on('receipt', function (receipt) {
            //console.log(receipt);
            console.log(receipt.events.bet.returnValues.win);
            document.getElementById("game_result").style.display = "block";
            if(receipt.events.bet.returnValues.win == "1"){
                document.getElementById("game_info").innerHTML = "You won!!! :)";
            } else {
                document.getElementById("game_info").innerHTML = "You lost :(";
            }
            get_account_balance();
            refresh_balance();
        })

}

document.getElementById("login_button").onclick = login;
document.getElementById("logout_button").onclick = logout;
document.getElementById("fund_button").onclick = fund;
document.getElementById("refresh_balance").onclick = refresh_balance;
document.getElementById("refresh_account_balance").onclick = get_account_balance;
document.getElementById("flip_heads").onclick = function () { flip(0, "heads"); };
document.getElementById("flip_tails").onclick = function () { flip(1, "tails"); }

main();

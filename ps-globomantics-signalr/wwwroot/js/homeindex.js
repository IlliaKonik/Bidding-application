
const initSignalRConnection = () => {
    const connection = new signalR.HubConnectionBuilder()
        .withUrl("/auctionhub", {
            transport: signalR.HttpTransportType.WebSockets,
            skipNegotiation: true,
        })
        .build();
    
    connection.on("ReceiveNewBid",
        ({auctionId, newBid}) =>{
        const tr = document.getElementById(auctionId + "-tr");
        const input = document.getElementById(auctionId + "-input");
        
        tr.classList.add("animate-highlight");
        setTimeout(() =>{tr.classList.remove("animate-highlight");}, 2000);
        
        const bidText = document.getElementById(auctionId + "-bidtext");
        bidText.innerHTML = newBid;
        input.value = newBid + 1;
        })

    connection.on("ReceiveNewAuction", ({ id, itemName, currentBid }) => {
        const tbody = document.querySelector("#table>tbody");
        tbody.innerHTML += `<tr id="${id}-tr" class="align-middle">
                                <td>${itemName}</td >
                                <td id="${id}-bidtext" class="bid">${currentBid}</td >
                                <td class="bid-form-td">
                                    <input id="${id}-input" class="bid-input" type="number" value="${currentBid + 1}" />
                                    <button class="btn btn-primary" type="button" onclick="submitBid(${id})">Bid</button>
                                    <div id="${id}-error" class="text-danger" style="display:none;">Your bid must be higher than the current bid.</div>
                                </td>
                            </tr>`;
    });
    
    connection.start().catch(console.error);
    return connection;
}

const connection = initSignalRConnection();
const submitBid = (auctionId) => {
    if(!validateBid(auctionId))
        return;
    
    const bid = document.getElementById(auctionId + "-input").value;
    
    fetch("/auction/" + auctionId + "/newbid?currentBid=" + bid, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    connection.invoke("NotifyNewBid",{
        auctionId: parseInt(auctionId),
        newBid: parseInt(bid),
    })
}

function validateBid(auctionId) {
    const currentBid = document.getElementById(auctionId + '-bidtext');
    const input = document.getElementById(auctionId + '-input');
    const errorDiv = document.getElementById(auctionId + '-error');
    
    if (parseFloat(input.value) <= parseFloat(currentBid.innerHTML)) {
        
        errorDiv.style.display = 'block';
        return false;
    }
    errorDiv.style.display = 'none';
    return true;
}

const submitAuction = () => {
    const itemName = document.getElementById("add-itemname").value;
    const currentBid = document.getElementById("add-currentbid").value;
    fetch("/auction", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itemName, currentBid })
    });
}


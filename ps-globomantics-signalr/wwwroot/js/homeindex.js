
const initSignalRConnection = () => {
    const connection = new signalR.HubConnectionBuilder()
        .withUrl("/auctionhub", {
            transport: signalR.HttpTransportType.WebSockets,
            skipNegotiation: true,
        })
        .withHubProtocol(new signalR.protocols.msgpack.MessagePackHubProtocol())
        .build();
    
    connection.on("ReceiveNewBid",
        ({AuctionId, NewBid}) =>{
        const tr = document.getElementById(AuctionId + "-tr");
        const input = document.getElementById(AuctionId + "-input");
        
        if(!tr.classList.contains("outbid")) {
            tr.classList.add("animate-highlight");
            setTimeout(() => {
                tr.classList.remove("animate-highlight");
            }, 2000);
        }
        
        const bidText = document.getElementById(AuctionId + "-bidtext");
        bidText.innerHTML = NewBid;
        input.value = NewBid + 1;
        })

    connection.on("ReceiveNewAuction", ({ Id, ItemName, CurrentBid }) => {
        const tbody = document.querySelector("#table>tbody");
        tbody.innerHTML += `<tr id="${Id}-tr" class="align-middle">
                                <td>${ItemName}</td >
                                <td id="${Id}}-bidtext" class="bid">${CurrentBid}</td >
                                <td class="bid-form-td">
                                    <input id="${Id}-input" class="bid-input" type="number" value="${CurrentBid + 1}" />
                                    <button class="btn btn-primary" type="button" onclick="submitBid(${id})">Bid</button>
                                    <div id="${Id}-error" class="text-danger" style="display:none;">Your bid must be higher than the current bid.</div>
                                </td>
                            </tr>`;
    });

    connection.on("NotifyOutbid", ({ AuctionId }) => {
        const tr = document.getElementById(AuctionId + "-tr");
        if (!tr.classList.contains("outbid"))
            tr.classList.add("outbid");
    });
    
    connection.start().catch(console.error);
    return connection;
}

const connection = initSignalRConnection();
const submitBid = (auctionId) => {
    if(!validateBid(auctionId))
        return;

    const tr = document.getElementById(auctionId + "-tr");
    tr.classList.remove("outbid");
    
    const bid = document.getElementById(auctionId + "-input").value;
    
    fetch("/auction/" + auctionId + "/newbid?currentBid=" + bid, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    if(!connection.state === "Connected"){
        location.reload();
    }
    
    connection.invoke("NotifyNewBid",{
        AuctionId: parseInt(auctionId),
        NewBid: parseInt(bid),
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


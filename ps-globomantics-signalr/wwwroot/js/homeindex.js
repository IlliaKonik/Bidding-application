
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


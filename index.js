const fetch = require("node-fetch");
const {AxieGene} = require("agp-npm/dist/axie-gene");

function constructQuery() {
    let query = "query GetAxieBriefList($criteria: AxieSearchCriteria) { "
    for (let i = 0; i < 30; i++) {
        query += `ax${i}: axies(auctionType: Sale, sort: PriceAsc, criteria: $criteria, from: ${i * 100}, size: 100) `
        query += "{ results { id genes auction { currentPrice } } }\n"
    }
    query += " }"
    return query
}

async function gatherAxiesFromQuery(classes, breedCount, parts) {
    endpoint = "https://axieinfinity.com/graphql-server-v2/graphql"

    body = {
        "operationName": "GetAxieBriefList",
        "variables": {"criteria": {"classes": classes, "breedCount": breedCount, "parts": parts}},
        "query": constructQuery()
    }

    var axies = [];
    
    await fetch(endpoint, {method: "POST", headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)})
        .then(resp =>
            resp.json().then(body => {
                for (let i = 0; i < 30; i++) {
                    body.data[`ax${i}`].results.forEach(axie => {
                        try {
                            const genes = new AxieGene(axie.genes)
                            // if (genes.tail.d.name != 'Thorny Caterpillar')
                            //     console.log(genes.tail);
                            // if (genes.horn.d.partId !== genes.horn.r1.partId) return
                            // if (genes.mouth.d.partId !== genes.mouth.r1.partId) return
                            // if (genes.tail.d.partId !== genes.tail.r1.partId) return
                            // if (genes.back.d.partId !== genes.back.r1.partId) return
                            axies = [...axies, axie]
                        } catch (error) {
                            console.log("Error parsing", axie.id, error)
                        }
                    })
                }
            }).catch(err => {
                console.log("ERROR", resp);
            })
        )

    return axies;
}

function createAllCombinations(tails, mouthes, horns, backs){
    let parts = [];

    for(let i = 0; i < tails.length; i++){
        for(let j = 0; j < mouthes.length; j++){
            for(let k = 0; k < horns.length; k++){
                for(let l = 0; l < backs.length; l++){
                    parts.push([tails[i], mouthes[j],  horns[k], backs[l]]);
                }
            }
        }
    }

    return parts;
}

let axies = [
    {
        classes: ["Plant"],
        tails: ["tail-carrot", "tail-hot-butt", "tail-cattail", "tail-yam"],
        mouthes: ["mouth-serious"],
        horns: ["horn-cactus", "horn-beech"],
        backs: ["back-pumpkin"],
        breedCount: [0],
        price: 0.0975
    },
    {
        classes: ["Reptile", "Mech"],
        tails: ["tail-thorny-caterpillar"],
        mouthes: ["mouth-tiny-turtle"],
        horns: ["horn-lagging"],
        backs: ["back-snail-shell"],
        breedCount: [0],
        price: 0.14
    },
    {
        classes: ["Beast", "Mech"],
        tails: ["tail-nut-cracker", "tail-cottontail", "tail-hare"],
        mouthes: ["mouth-nut-cracker", "mouth-goda"],
        horns: ["horn-dual-blade", "horn-imp"],
        backs: ["back-risky-beast", "back-ronin"],
        breedCount: [0],
        price: 0.092
    }

]
axies.forEach(function(axie){
    parts = createAllCombinations(axie.tails, axie.mouthes, axie.horns, axie.backs);
    parts.forEach(function(part, index){
        setTimeout(() => {
            gatherAxiesFromQuery(axie.classes, axie.breedCount, part).then(axiez => {
                axiez.forEach(function(axiez){
                    const genes = new AxieGene(axiez.genes)
        
                    let hornsGood = mouthesGood = tailsGood = backsGood = false;
        
                    if (axie.horns.indexOf((genes.horn.d.partId)) > -1 && axie.horns.indexOf((genes.horn.r1.partId)) > -1 && axie.horns.indexOf((genes.horn.r2.partId)) > -1) {
                        hornsGood = true;
                    }
                    if (axie.tails.indexOf((genes.tail.d.partId)) > -1 && axie.tails.indexOf((genes.tail.r1.partId)) > -1 && axie.tails.indexOf((genes.tail.r2.partId)) > -1) {
                        tailsGood = true;
                    }
                    if (axie.backs.indexOf((genes.back.d.partId)) > -1 && axie.backs.indexOf((genes.back.r1.partId)) > -1 && axie.backs.indexOf((genes.back.r2.partId)) > -1) {
                        backsGood = true;
                    }
                    if (axie.mouthes.indexOf((genes.mouth.d.partId)) > -1 && axie.mouthes.indexOf((genes.mouth.r1.partId)) > -1 && axie.mouthes.indexOf((genes.mouth.r2.partId)) > -1) {
                        mouthesGood = true;
                    }
        
                    if (hornsGood && mouthesGood && tailsGood && backsGood){
                        let price = (parseFloat(axiez.auction.currentPrice.slice(0, -14)) / 10000).toString();
                        if (price <= axie.price)
                            console.log(axie.classes, axiez.id, price)
                    }
        
                })
            });    
        }, index * 250);
    })    
});

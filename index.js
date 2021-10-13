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
        tails: ["tail-carrot", "tail-hot-butt", "tail-yam"],
        mouthes: ["mouth-serious"],
        horns: ["horn-cactus", "horn-beech"],
        backs: ["back-pumpkin"],
        breedCount: [0, 7],
        constraints: [
            // {
            //     price: 0.092,
            //     score: .96
            // },
            {
                price: 0.07,
                score: .50
            }
        ],
    },
    {
        classes: ["Reptile", "Mech"],
        tails: ["tail-thorny-caterpillar"],
        mouthes: ["mouth-tiny-turtle"],
        horns: ["horn-lagging"],
        backs: ["back-snail-shell"],
        breedCount: [0, 7],
        constraints: [
            {
                price: .0675,
                score: .53
            },
            // {
            //     price: .085,
            //     score: .875
            // },
            // {
            //     price: .09,
            //     score: .9
            // },
            // {
            //     price: .01,
            //     score: .95
            // }
        ],
    },
    {
        classes: ["Beast", "Mech"],
        tails: ["tail-nut-cracker",  "tail-hare"],
        mouthes: ["mouth-nut-cracker"],
        horns: ["horn-dual-blade", "horn-imp"],
        backs: ["back-risky-beast", "back-ronin"],
        breedCount: [0, 7],
        constraints: [
            {
                price: .0475,
                score: .50
            },
            // {
            //     price: .085,
            //     score: .875
            // },
            // {
            //     price: .09,
            //     score: .9
            // },
            {
                price: .06,
                score: .50
            }

        ],
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
                    let hornsr1 = mouthesr1 = tailsr1 = backsr1 = false;
                    let hornsr2 = mouthesr2 = tailsr2 = backsr2 = false;

                    if (axie.horns.indexOf((genes.horn.d.partId)) > -1){
                        hornsGood = true;
                    }
        
                    if (axie.horns.indexOf((genes.horn.r1.partId)) > -1) {
                        hornsr1 = true;
                    }
                    if (axie.horns.indexOf((genes.horn.r2.partId)) > -1) {
                        hornsr2 = true;
                    }

                    if (axie.tails.indexOf((genes.tail.d.partId)) > -1){
                        tailsGood = true;
                    }
        
                    if (axie.tails.indexOf((genes.tail.r1.partId)) > -1) {
                        tailsr1 = true;
                    }
                    if (axie.tails.indexOf((genes.tail.r2.partId)) > -1) {
                        tailsr2 = true;
                    }

                    if (axie.backs.indexOf((genes.back.d.partId)) > -1){
                        backsGood = true;
                    }
        
                    if (axie.backs.indexOf((genes.back.r1.partId)) > -1) {
                        backsr1 = true;
                    }
                    if (axie.backs.indexOf((genes.back.r2.partId)) > -1) {
                        backsr2 = true;
                    }
                    if (axie.mouthes.indexOf((genes.mouth.d.partId)) > -1){
                        mouthesGood = true;
                    }
        
                    if (axie.mouthes.indexOf((genes.mouth.r1.partId)) > -1) {
                        mouthesr1 = true;
                    }
                    if (axie.mouthes.indexOf((genes.mouth.r2.partId)) > -1) {
                        mouthesr2 = true;
                    }

                    let mouthScore = (mouthesr2 ? .0625 : 0) + (mouthesr1 ? 0.1875 : 0) + (mouthesGood ? 0.75 : 0)
                    let tailScore = (tailsr2 ? .0625 : 0) + (tailsr1 ? 0.1875 : 0) + (tailsGood ? 0.75 : 0)
                    let backScore = (backsr2 ? .0625 : 0) + (backsr1 ? 0.1875 : 0) + (backsGood ? 0.75 : 0)
                    let hornScore = (hornsr2 ? .0625 : 0) + (hornsr1 ? 0.1875 : 0) + (hornsGood ? 0.75 : 0)

                    let score = ( mouthScore + tailScore + backScore + hornScore ) / 4;
        
                    axie.constraints.forEach((constraint) => {
                        let price = (parseFloat(axiez.auction.currentPrice.slice(0, -14)) / 10000).toString();

                        if (score >= constraint.score && price <= constraint.price)
                            console.log(score * 100 + "%", axie.classes, axiez.id, price)
                    })        
                })
            });    
        }, index * 1250);
    })    
});

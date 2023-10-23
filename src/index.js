import {SpaceX} from "./api/spacex";
import * as d3 from "d3";
import * as Geo from './geo.json'
import { interpolate } from "d3";

document.addEventListener("DOMContentLoaded", setup)

var svg;
var launchpads_map;

function setup(){
    const spaceX = new SpaceX();
    spaceX.launches().then(data=>{
        const listContainer = document.getElementById("listContainer")
        drawMap();
        renderLaunches(data, listContainer);
    })
}
function renderLaunches(launches, container){

    const list = document.createElement("ul");
    launches.forEach(launch=>{
        const item = document.createElement("li");
        //item.classList.add('hoverable');
        item.innerHTML = launch.name;
        let node = document.createAttribute("id")
        node.value=launch.launchpad;
        item.attributes.setNamedItem(node);
        list.appendChild(item);

        item.addEventListener(
            "mouseover",
            (event) => {
                event.target.style.color = "red";
                console.log(event.target.id);
                let launchpad = launchpads_map.get(event.target.id);
                console.log(launchpads_map);
                console.log(launchpad);
                svg.selectAll("circle")
                    .filter(function() {
                        let latitude = d3.select(this).attr("cx");
                        let longitude = d3.select(this).attr("cy");
                        console.log(latitude, longitude);
                        let equal = latitude == launchpad[0] && longitude == launchpad[1]; // filter by single attribute
                        console.log(equal);
                        return equal

                    })
                    .attr("fill", "red");

            },
            false,
        );
        item.addEventListener(
            "mouseout",
            (event) => {
                event.target.style.color = "black";
                svg.selectAll("circle")
                    .filter(function() {
                        let attr = d3.select(this).attr("cx");
                        console.log(attr)
                        return attr == 969.8737862993539; // filter by single attribute
                    })
                    .attr("fill", "black");

            },
            false,
        );

    })
    container.replaceChildren(list);
}

function listofLaunchpads(launchpads){
    launchpads_map = new Map();
    let arr = new Array();
    launchpads.forEach(launchpad=>{
        const latitude = launchpad.latitude;
        const longitude = launchpad.longitude;
        const launchpad_id = launchpad.id;
        arr.push([latitude, longitude]);
        launchpads_map.set(launchpad_id, [latitude, longitude]);
    });

    return arr;
}

function drawMap(){
    const width = 1140;
    const height = 680;
    const margin = {top: 20, right: 10, bottom: 40, left: 10};
    const projection = d3.geoMercator()
        .scale(140)
        .center([0,20])
        .translate([width / 2 - margin.left, height / 2]);
    const pathGenerator = d3.geoPath().projection(projection);
    const spaceX = new SpaceX();
    svg = d3.select('#map').append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    svg.append("g")
        .selectAll("path")
        .data(Geo.features)
        .enter()
        .append("path")
        .attr("class", "topo")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .attr("fill", function (d){})
        .style("opacity", .7);

    spaceX.launchpads().then(datapads=>{
        data = listofLaunchpads(datapads);
        svg.selectAll("circle")
            .data(data).enter()
            .append("circle")
            .attr("cx", function (d) { console.log(projection(d)); return projection(d)[0]; })
            .attr("cy", function (d) { return projection(d)[1]; })
            .attr("launchpad_id", function(d){
                
            })
            .attr("r", "5px")
            .attr("fill", "black")
    });

}

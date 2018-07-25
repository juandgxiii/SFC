let dat_act;
let dat_cart;
let nombres = [];
const h = Math.max(400, window.innerHeight * 0.4); //800
const w = Math.max(600, window.innerWidth * 0.95); //1400
const paddingX = 120;
const paddingY = 50;

const moneda = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 2});

function draw(datos_global, svg_id) {
  let banco = document.getElementById("lista").value;
  datos = datos_global[banco];
  let bd = [];

  let fecha_min = new Date(2010, 4, 1);
  let fecha_max = new Date(2020, 4, 1);

  for (let i in datos){
      let fecha = new Date(i.substring(0,4), i.substring(4,6)-1, 1)
        if (fecha_min <= fecha && fecha <= fecha_max) {bd.push([fecha, datos [i]]);}
  }

  bd.sort((a, b) => a[0] > b[0]);

  const num = bd.length;

  const escalaY = d3.scaleLinear()
    .domain([d3.min(bd, d => d[1]) * 0.9, d3.max(bd, d => d[1])])
    .range([h - paddingY, 0]);
  const escalaX = d3.scaleTime()
    .domain([bd[0][0], bd[num-1][0].setMonth(bd[num-1][0].getMonth()+1)])
    .range([paddingX, w]);

  const formatoFecha = d3.timeFormat("%b-%y");

  const ejeY = d3.axisLeft(escalaY);
  const ejeX = d3.axisBottom(escalaX)
    .tickFormat(formatoFecha)
    .ticks(num);

  let svg = d3.select(svg_id)
    .attr("width", w)
    .attr("height", h);

  let gridlines = d3.axisLeft()
  .tickFormat("")
  .tickSize(-w + paddingX)
  .scale(escalaY);

  svg
  .append("g")
  .attr('transform', 'translate(' + paddingX + ', 0)')
  .attr("class", "grid")
  .call(gridlines);

  let bars = svg
    .selectAll("rect")
    .data(bd)
    .enter()
    .append("rect")

    bars
    .attr("x", (d,i) => paddingX + (i * ((w - paddingX) / num)))
    .attr("y", h - paddingY)
    .attr("width", (w - paddingX - num) / num)
    .attr("height", 0)
    .on("mouseover", function (d) {
      let svg_y = document.getElementById(svg_id.substring(1,svg_id.length)).getBoundingClientRect().top;
      let xpos = parseFloat(d3.select(this).attr('x'));
      let ypos = parseFloat(d3.select(this).attr('y')) + parseFloat(d3.select(this).attr('height'))/4 + svg_y;
      d3.select('#tooltip')
        .style('left', xpos + 'px')
        .style('top', ypos + 'px')
        .select('#tooltip_valor')
        .html('<b>' + formatoFecha(d[0]) + '</b>: ' + moneda.format(d[1]));
      d3.select('#tooltip').classed('hidden', false);
      })
    .on("mouseout", () => d3.select('#tooltip').classed('hidden', true))
    .attr("class", "bar");

    bars
    .transition()
    .attr("y", d => escalaY(d[1]))
    .attr("height", d => h - escalaY(d[1]) - paddingY)
    .style("fill", (d) => {
      let m = (h - escalaY(d[1]) - paddingY)/(h - paddingY);
      return 'rgb('+ 20*m + ', ' + 80*m + ', ' + 180*m + ')';
    });

  svg
    .append('g')
    .attr('transform', 'translate(' + paddingX + ', 0)')
    .call(ejeY);

  svg
    .append('g')
    .attr('transform', 'translate(0, ' + (h - paddingY) + ')')
    .call(ejeX)
    .attr("text-anchor", "right")
    .attr("class", "tickX")
    .selectAll("text")
    .attr("transform", 'rotate(-90) translate(-' + paddingY + ', 0)');
}

window.onload = () => document.getElementById("lista").onchange = reset;

let p1 = d3.json("https://unpkg.com/d3-time-format@2.1.1/locale/es-ES.json");
let p2 = d3.text("activos.json");
let p3 = d3.text("cartera.json");

Promise.all([p1, p2, p3]).then((v) => {
  d3.timeFormatDefaultLocale(v[0]);
  dat_act = JSON.parse(v[1]);
  dat_cart = JSON.parse(v[2]);

  for (let i in dat_act) {
    nombres.push(i);
  }

  d3.select("#lista")
    .selectAll("option")
    .data(nombres)
    .enter()
    .append("option")
    .attr("value", d => d)
    .html(d => d.substring(d.indexOf("-") + 2, d.length));

    draw(JSON.parse(v[1]), "#svg-act");
    draw(JSON.parse(v[2]), "#svg-cart");
})

function reset() {
  d3.select("#svg-act").html("");
  draw(dat_act, "#svg-act");

  d3.select("#svg-cart").html("");
  draw(dat_cart, "#svg-cart");
}

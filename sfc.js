d3.json("es-ES.json").then(function(x){
  d3.timeFormatDefaultLocale(x);
});
let dat;
const h = Math.max(400, window.innerHeight * 0.8);
const w = Math.max(600, window.innerWidth * 0.8);

function draw(datos) {
  datos = JSON.parse(datos);
  let bd = {};
  let nombres = [];

  for (let i in datos) {
    bd[i] = []
    nombres.push(i);
    for (let j in datos[i]) {
      let fecha = new Date(j.substring(0,4), j.substring(4,6), j.substring(6,8))
      bd[i].push([fecha, datos[i][j]]);
    }
  }

  d3.select("#lista")
    .selectAll("option")
    .data(nombres)
    .enter()
    .append("option")
    .attr("value", d => d)
    .html(d => d.substring(d.indexOf("-")+2, d.length));

  let banco = document.getElementById("lista").value;
  const num = bd[banco].length;
  const padding = 100;
  const escalaY = d3.scaleLinear()
    .domain([d3.min(bd[banco], d => d[1]), d3.max(bd[banco], d => d[1])])
    .range([h - padding, padding]);
  const escalaX = d3.scaleTime()
    .domain([bd[banco][0][0], bd[banco][num-1][0]])
    .range([0, w - padding]);

  const moneda = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 2});
  const axisY = d3.axisLeft(escalaY);
  const axisX = d3.axisBottom(escalaX)
    .tickFormat(d3.timeFormat("%b-%y"));

  let svg = d3.select("#svg")
    .attr("width", w)
    .attr("height", h);

  svg
    .selectAll("rect")
    .data(bd[banco])
    .enter()
    .append("rect")
    .attr("x", (d,i) => padding + (i - 1) * ((w - num - padding) / (num - 1)) + i)
    .attr("y", d => escalaY(d[1]))
    .attr("width", (w - num - padding) / num)
    .attr("height", d => h - escalaY(d[1]) - padding)
    .on("mouseover", function (d) {
      let xpos = parseFloat(d3.select(this).attr('x'));
      let ypos = parseFloat(d3.select(this).attr('y')) + padding;
      d3.select('#tooltip')
        .style('left', xpos + 'px')
        .style('top', ypos + 'px')
        .select('#tooltip_valor')
        .html(moneda.format(d[1]));
      d3.select('#tooltip').classed('hidden', false);
      })
    .on("mouseout", () => d3.select('#tooltip').classed('hidden', true))
    .attr("class", "bar");

  svg
    .append('g')
    .attr('transform', 'translate(' + padding + ', 0)')
    .call(axisY);

  svg
    .append('g')
    .attr('transform', 'translate(' + padding + ', ' + (h-padding) + ')')
    .call(axisX);
}

d3.text("bd.json").then((x) => {
  document.getElementById("lista").onchange = reset;
  dat = x;
  draw(x)
});

function reset() {
  d3.select("#svg").html("");
  draw(dat);
}

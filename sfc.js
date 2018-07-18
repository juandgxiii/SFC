d3.json("es-ES.json").then(function(x){
  d3.timeFormatDefaultLocale(x);
});
let t;
const h = Math.max(400, window.innerHeight * 0.8);
const w = Math.max(600, window.innerWidth * 0.8);

function draw(datos) {
  datos = JSON.parse(datos);
  t = datos;
  const num = datos.length;
  const padding = 100;
  const escalaY = d3.scaleLinear()
    .domain([d3.min(datos), d3.max(datos)])
    .range([h - padding, padding]);
  const escalaX = d3.scaleTime()
    .domain([new Date(2015, 0, 1), new Date(2018, 4, 1)])
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
    .data(datos)
    .enter()
    .append("rect")
    .attr("x", (d,i) => padding + (i - 1) * ((w - num - padding) / (num - 1)) + i)
    .attr("y", d => escalaY(d))
    .attr("width", (w - num - padding) / num)
    .attr("height", d => h - escalaY(d) - padding)
    .on("mouseover", function (d) {
      let xpos = parseFloat(d3.select(this).attr('x'));
      let ypos = parseFloat(d3.select(this).attr('y')) + padding;
      d3.select('#tooltip')
        .style('left', xpos + 'px')
        .style('top', ypos + 'px')
        .select('#tooltip_valor')
        .html(moneda.format(d));
      d3.select('#tooltip').classed('hidden', false);
      })
    .on("mouseout", (d) => d3.select('#tooltip').classed('hidden', true))
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

d3.text("bd_array.txt").then(draw);

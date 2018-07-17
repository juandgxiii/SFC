const h = Math.max(400, window.innerHeight * 0.8);
const w = Math.max(600, window.innerWidth * 0.8);

const moneda = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD', maximumFractionDigits: 2});

function draw(datos) {
  datos = JSON.parse(datos);
  const num = datos.length;
  const padding = 100;
  const escala = d3.scaleLinear()
    .domain([d3.min(datos), d3.max(datos)])
    .range([h, padding]);
  const axis = d3.axisLeft(escala);

  let svg = d3.select("#activos")
    .append("svg")
    .attr("width", w)
    .attr("height", h);

  svg
    .selectAll("rect")
    .data(datos)
    .enter()
    .append("rect")
    .attr("x", (d,i) => i * ((w-num-padding)/num + 1) + padding)
    .attr("y", d => escala(d))
    .attr("width", (w-num-padding)/num)
    .attr("height", d => h - escala(d))
    .on("mouseover", function (d) {
      let xpos = parseFloat(d3.select(this).attr('x'));
      let ypos = parseFloat(d3.select(this).attr('y')) / 2 + (h / 2);
      d3.select('#tooltip')
        .style('left', xpos + 'px')
        .style('top', ypos + 'px')
        .select('#tooltip_valor')
        .html(moneda.format(d));
      d3.select('#tooltip').classed('hidden', false);
      })
    .on("mouseout", (d) => d3.select('#tooltip').classed('hidden', true))
    .attr("class", "bar");

// Labels
//   svg
//     .selectAll("text")
//     .data(datos)
//     .enter()
//     .append("text")
//     .text(d => d.toString().substring(0,2))
//     .attr("x", (d,i) => i * ((w-num-padding)/num + 1) + padding + 9)
//     .attr("y", d => escala(d) + 20)
//     .attr("class", "etiqueta");

  svg
    .append('g')
    .attr('transform', 'translate(' + padding + ', 0)')
    .call(axis);
}

function mouse_over() {

}

function mouse_out() {

}

d3.text("bd_array.txt").then(draw);

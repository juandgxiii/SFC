const h = Math.max(400, window.innerHeight * 0.8);
const w = Math.max(600, window.innerWidth * 0.8);

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
  .attr("class", "bar")
  .append("title")
  .text(d => d.toString().substring(0,2) + ',' + d.toString().substring(2,5) + ' bn');

  svg
  .selectAll("text")
  .data(datos)
  .enter()
  .append("text")
  .text(d => d.toString().substring(0,2))
  .attr("x", (d,i) => i * ((w-num-padding)/num + 1) + padding + 9)
  .attr("y", d => escala(d) + 20)
  .attr("class", "etiqueta");

  svg
  .append('g')
  .attr('transform', 'translate(' + padding + ', 0)')
  .call(axis);
}

d3.text("bd_array.txt").then(draw);

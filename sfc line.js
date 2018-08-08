let dat;
let nombres = [];
const h = Math.max(400, window.innerHeight * 0.4); //800
const w = Math.max(600, window.innerWidth * 0.95); //1400
const paddingX = 120;
const paddingY = 50;

function draw(datos_global) {
  let banco = document.getElementById('lista').value;
  datos = datos_global[banco];

  let fechas = [];
  for (let i in datos['fechas']){
      let fecha = new Date(parseInt(datos['fechas'][i].substring(0,4)), parseInt(datos['fechas'][i].substring(4,6)) - 1, 1);
      fechas.push(fecha);
  }

  datos['fechas_js'] = fechas;

  const num = datos['fechas_js'].length;

  const escalaY = d3.scaleLinear()
    .domain([d3.min(datos['resultados']) * 0.9, Math.max(0, d3.max(datos['resultados']))])
    .range([h - paddingY, 0]);
  const escalaX = d3.scaleTime()
    .domain([datos['fechas_js'][0], datos['fechas_js'][num - 1].setMonth(datos['fechas_js'][num - 1].getMonth() + 1)])
    .range([paddingX, w]);

  const moneda = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0});
  const formatoFecha = d3.timeFormat('%b-%y');

  const ejeY = d3.axisLeft(escalaY);
  const ejeX = d3.axisBottom(escalaX)
    .tickFormat(formatoFecha)
    .ticks(num);

  let svg_cart = d3.select('#svg-cart')
    .attr('width', w)
    .attr('height', h);

  let gridlines = d3.axisLeft()
  .tickFormat('')
  .tickSize(-w + paddingX)
  .scale(escalaY);

  svg_cart
  .append('g')
  .attr('transform', 'translate(' + paddingX + ', 0)')
  .attr('class', 'grid')
  .call(gridlines);

  svg_cart
    .append('g')
    .attr('transform', 'translate(' + paddingX + ', 0)')
    .call(ejeY);

  svg_cart
    .append('g')
    .attr('transform', 'translate(0, ' + (h - paddingY) + ')')
    .call(ejeX)
    .attr('text-anchor', 'right')
    .attr('class', 'tickX')
    .selectAll('text')
    .attr('transform', 'rotate(-90) translate(-' + paddingY + ', 0)');

    let linea = d3.line()
      .x((d,i) => paddingX + (i * ((w - paddingX) / num)))
      .y(d => escalaY(d));

  svg_cart
      .append('path')
      .attr('d', linea(datos['resultados']))
      .style("stroke-width", 2)
      .style("stroke", "steelblue")
      .style("fill", "none");
}

window.onload = () => document.getElementById('lista').onchange = reset;

let p1 = d3.json('https://unpkg.com/d3-time-format@2.1.1/locale/es-ES.json');
let p2 = d3.json('datos.json');

Promise.all([p1, p2]).then((v) => {
  d3.timeFormatDefaultLocale(v[0]);
  dat = v[1];

  for (let i in v[1]) {
    nombres.push(i);
  }

  d3.select('#lista')
    .selectAll('option')
    .data(nombres)
    .enter()
    .append('option')
    .attr('value', d => d)
    .html(d => d.substring(d.indexOf('-') + 2, d.length));

    draw(v[1]);
})

function reset() {
  d3.select('#svg-cart').html('');
  // d3.select('#svg-cart').html('');
  draw(dat);
}

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
    .domain([d3.min(datos['cartera_total']) * 0.9, d3.max(datos['cartera_total'])])
    .range([h - paddingY, 0]);
  const escalaX = d3.scaleTime()
    .domain([datos['fechas_js'][0], datos['fechas_js'][num - 1].setMonth(datos['fechas_js'][num - 1].getMonth() + 1)])
    .range([paddingX, w]);

  const moneda = new Intl.NumberFormat('en-US', {style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0});
  const formatoFecha = d3.timeFormat('%e %b-%y');

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

  let bars = svg_cart
    .selectAll('rect')
    .data(datos['cartera_total'])
    .enter()
    .append('rect')

    bars
    .attr('x', (d,i) => paddingX + (i * ((w - paddingX) / num)))
    .attr('y', h - paddingY)
    .attr('width', (w - paddingX - num) / num)
    .attr('height', 0)
    .attr('class', 'bar')
    .on('mouseover', function (d,i) {
      this.setAttribute('style', 'fill: #0ce');
      let svg_y = document.getElementById('svg-cart').getBoundingClientRect().top;
      let xpos = parseFloat(d3.select(this).attr('x'));
      let ypos = parseFloat(d3.select(this).attr('y')) + parseFloat(d3.select(this).attr('height'))/4 + svg_y;
      d3.select('#tooltip')
        .style('left', xpos + 'px')
        .style('top', ypos + 'px')
        .select('#tooltip_valor')
        .html(
          '<b>' + banco.substring(banco.indexOf('-') + 2, banco.length) + ':</b> '+
          formatoFecha(datos['fechas_js'][i]) +'<br>' +
          'Total cartera: ' + moneda.format(d) + '<br>' +
          'ICC: ' + parseFloat(100*(datos['ICC'][i])).toFixed(2) + '%');
      d3.select('#tooltip').classed('hidden', false);
      })
    .on('mouseout', function (d) {
      let m = (h - escalaY(d) - paddingY)/(h - paddingY);
      let c = 'fill: rgb('+ 20*m + ', ' + 80*m + ', ' + 180*m + ')';
      this.setAttribute('style', c);
      d3.select('#tooltip').classed('hidden', true);
     })
    ;

    bars
    .transition()
    .duration(300)
    .attr('y', d => escalaY(d))
    .attr('height', d => h - escalaY(d) - paddingY)
    .style('fill', d => {
      let m = (h - escalaY(d) - paddingY)/(h - paddingY);
      return 'rgb('+ 20*m + ', ' + 80*m + ', ' + 180*m + ')';
    });

    svg_cart
      .selectAll('text.labels')
      .data(datos['ICC'])
      .enter()
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', (d,i) => paddingX + (i * ((w - paddingX) / num)) + ((w - paddingX - num) / num)/2)
      .attr('y', (d,i) => escalaY(datos['cartera_total'][i]) + 30)
      .attr('class', 'label')
      .text(d => String((100 * parseFloat(d)).toFixed(1)));

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

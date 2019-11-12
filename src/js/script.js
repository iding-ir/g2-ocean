/*
Oct 27 2019
Created by Aydin Ghane to demonstrate ECMA6 and jQuery skills
Website: http://iding.ir
Email: aydin.ghane.kh@gmail.com
Demo: http://g2ocean.iding.ir
*/

import $ from 'jquery';
import 'easy-autocomplete';
import 'bootstrap';
import Mapcraft from './mapcraft';

$(document).ready(function () {
  let app = new Mapcraft({
    map: {
      container: 'app-map',
      center: [35, 35],
      hash: true,
    },
    style: 'light',
    icons: {
      port: './assets/images/icon-port.png',
      vessel: './assets/images/icon-vessel.png',
      default: './assets/images/icon-default.png',
    },
    geoJsons: {
      routes: './data/routes.json',
      ports: './data/ports.json',
      vessels: './data/vessels.json',
    },
  });

  app.load().then(() => {
    $('form')[0].reset();

    let data = app.geoJsons.vessels.features.reduce((total, item) => {
      total.push(...item.properties.cargoes);

      return total;
    }, []);

    $('#app-search').easyAutocomplete({
      data: data,
      getValue: 'id',
      list: {
        match: {
          enabled: true,
        },
        maxNumberOfElements: 10,
      },
    });

    $('.app-layer-manager').on('change', function () {
      let layer = $(this).attr('data-layer');
      let state = $(this).is(':checked') ? 'visible' : 'none';

      app.switchLayer({
        layer: layer,
        state: state,
      });
    });

    $('.app-route-manager').on('click', function () {
      let route = $(this).attr('data-route');

      let geoJson = Object.assign({}, app.geoJsons.routes);

      geoJson.features = geoJson.features.filter(feature => feature.properties.id === route);

      app.fitBounds({
        geoJson: geoJson,
      });
    });

    $('.app-style-manager').on('change', function () {
      app.options.style = $(this).attr('data-style');

      app.colorizeDefaultMap({
        colors: app.options.defaultMapColors,
        style: app.options.style,
      });
    });

    $('#app-search-submit').on('click', function (event) {
      event.preventDefault();

      let id = $('#app-search').val();

      let geoJson = Object.assign({}, app.geoJsons.vessels);

      geoJson.features = geoJson.features.filter(feature => {
        return feature.properties.cargoes.filter(cargo => cargo.id === id).length;
      });

      app.fitBounds({
        geoJson: geoJson,
      });
    });

    app.map.on('click', 'point-symbol-vessels', function (event) {
      let id = event.features[0].properties.id;
      let name = event.features[0].properties.name;
      let routes = JSON.parse(event.features[0].properties.routes);
      let cargoes = JSON.parse(event.features[0].properties.cargoes);

      let cargosHtml = cargoes.reduce((total, item) => {
        return total += `<span class="app-cargo" data-owner="${item.owner}">${item.id}</span>`;
      }, '');

      let modal = $('#app-modal-vessel');

      modal.modal('show');
      modal.find('.modal-title').html(name);
      modal.find('.app-cargo-result').html(`<h4>Cargo:</h4><p>(by cargo-id)</p><div class="app-cargoes">${cargosHtml}</div>`);

      $('#app-search-owner').easyAutocomplete({
        data: cargoes,
        getValue: 'owner',
        list: {
          match: {
            enabled: true,
          },
          maxNumberOfElements: 10,
        },
      });

      $('#app-search-owner').on('input', function () {
        let input = $('#app-search-owner').val();

        $('.app-cargo').css({
          opacity: 0.5,
        });

        let match = [...$('.app-cargo')].filter((item, index) => {
          return $(item).attr('data-owner').indexOf(input) !== -1;
        });

        $(match).css({
          opacity: 1,
        });
      });

      $('#app-search-owner-submit').on('click', function (event) {
        event.preventDefault();

        let input = $('#app-search-owner').val();

        $('.app-cargo').css({
          display: 'none',
        });

        let match = $('.app-cargo[data-owner="' + input + '"]');

        match.css({
          display: 'inline',
        });
      });

      $('#app-search-owner-reset').on('click', function () {
        $('.app-cargo').css({
          display: 'inline',
          opacity: 1,
        });
      });
    });

    app.map.on('click', 'point-symbol-ports', function (event) {
      let name = event.features[0].properties.name;
      let routes = JSON.parse(event.features[0].properties.routes);
      let coordinates = event.features[0].geometry.coordinates.slice();

      while (Math.abs(event.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += event.lngLat.lng > coordinates[0] ? 360 : -360;
      }

      let vesselsHtml = app.geoJsons.vessels.features.filter(feature => {
        return feature.properties.routes.filter(route => routes.includes(route)).length;
      }).reduce((total, vessel) => {
        return total += `<li>${vessel.properties.name}</li>`;
      }, '');

      // let vessels = [];

      // app.geoJsons.vessels.features.forEach(feature => {
      //   feature.properties.routes.forEach(route => {
      //     if(routes.includes(route)) vessels.push({feature, route});
      //   });
      // });

      // let vesselsHtml = vessels.reduce((total, vessel) => {
      //   return total += `<li>${vessel.feature.properties.name} via ${vessel.route}.</li>`;
      // }, '');

      let html = `<div class="card">
      <div class="card-header"><h6>${name}</h6></div>
      <div class="card-body">
        <h6>Vessels</h6>
        <p>The following vessels visit this port:</p>
        <ul>${vesselsHtml}</ul>
      </div>
      </div>`;

      app.openPopup({
        lnglat: coordinates,
        html: html,
      });
    });

    app.map.on('click', 'polyline-line-routes', function (event) {
      let id = event.features[0].properties.id;
      let name = event.features[0].properties.name;
      let coordinates = event.lngLat;

      let vesselsHtml = app.geoJsons.vessels.features.filter(feature => {
        return feature.properties.routes.filter(route => route === id).length;
      }).reduce((total, vessel) => {
        return total += `<li>${vessel.properties.name}</li>`;
      }, '');

      let html = `<div class="card">
      <div class="card-header"><h6>${name}</h6></div>
      <div class="card-body">
        <h6>Vessels</h6>
        <p>The following vessels use this route:</p>
        <ul>${vesselsHtml}</ul>
      </div>
      </div>`;

      app.openPopup({
        lnglat: coordinates,
        html: html,
      });
    });
  }).catch(error => {
    console.error(error);
  });
});
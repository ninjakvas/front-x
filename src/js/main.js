import svg4everybody from 'svg4everybody';
import $ from 'jquery';
import 'slick-carousel';
import {slickNext, slickPrev} from './inc/utils';

// add SVG external content support to all browsers
svg4everybody();

$('.slider-1').slick({
  prevArrow: slickPrev('angle-left'),
  nextArrow: slickNext('angle-right'),
});


var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

import {
  BALL_RADIUS,
  // CANVAS_SIZE,
  DESKTOP_CANVAS_SIZE,
  STARTING_BALLS,
  RUN,
  STATIC_PEOPLE_PERCENTATGE,
  STATES,
  DEFAULT_INTERVENTION_PARAMETERS
} from './options.js'

import {
  replayButton,
  runNowButton,
  // glovesPct,
  // gownPct,
  maskPct,
  handwashPct,
  n95Pct,
  baselineR0,
  testFrequency,
  testPct,
  emergencyLockdown,
  socialDistancePct
} from './dom.js'

import { Ball } from './Ball.js'
import createSpriteSheet from './createSpriteSheet.js'

import { resetValues, updateCount } from './results.js'

let balls = []
const matchMedia = window.matchMedia('(min-width: 800px)')

let isDesktop = matchMedia.matches

export const Canvas = new window.p5(sketch => {
  // eslint-disable-line
  const startBalls = sprite => {
    let id = 0
    balls = []
    Object.keys(STARTING_BALLS).forEach(state => {
      Array.from({ length: STARTING_BALLS[state] }, () => {
        const hasMovement = RUN.filters.stayHome
          ? sketch.random(0, 100) < STATIC_PEOPLE_PERCENTATGE ||
            state === STATES.infected
          : true

        balls[id] = new Ball({
          id,
          sketch,
          state,
          hasMovement,
          x: sketch.random(BALL_RADIUS, sketch.width - BALL_RADIUS),
          y: sketch.random(BALL_RADIUS, sketch.height - BALL_RADIUS)
        })
        id++
      })
    })
  }

  const createCanvas = () => {
    // const { height, width } = isDesktop ? DESKTOP_CANVAS_SIZE : CANVAS_SIZE
    const {height, width} = DESKTOP_CANVAS_SIZE

    sketch.createCanvas(width, height)
  }

  sketch.setup = () => {
    createCanvas()
    createSpriteSheet(sketch)
    startBalls()

    matchMedia.addListener(e => {
      isDesktop = e.matches
      createCanvas()
      startBalls()
      resetValues()
    })

    runNowButton.onclick = () => {
      startBalls()
      resetValues()
    }

    replayButton.onclick = () => {
      startBalls()
      resetValues()
    }

    baselineR0.onchange = val => {
      DEFAULT_INTERVENTION_PARAMETERS.baselineR0 = parseFloat(val.target.value)
    }
    baselineR0.setAttribute(
      'value',
      DEFAULT_INTERVENTION_PARAMETERS.baselineR0.toString()
    )

    emergencyLockdown.onchange = () => {
      DEFAULT_INTERVENTION_PARAMETERS.emergencyLockdown = emergencyLockdown.checked
    }
    emergencyLockdown.setAttribute(
      'value',
      DEFAULT_INTERVENTION_PARAMETERS.emergencyLockdown
    )

    // glovesPct.onchange = val => {
    //   DEFAULT_INTERVENTION_PARAMETERS.glovesPct = parseInt(val.target.value)
    // }
    // glovesPct.setAttribute(
    //   'value',
    //   DEFAULT_INTERVENTION_PARAMETERS.glovesPct.toString()
    // )

    maskPct.onchange = val => {
      DEFAULT_INTERVENTION_PARAMETERS.maskPct = parseInt(val.target.value)
    }
    maskPct.setAttribute(
      'value',
      DEFAULT_INTERVENTION_PARAMETERS.maskPct.toString()
    )

    // gownPct.onchange = val => {
    //   DEFAULT_INTERVENTION_PARAMETERS.gownPct = parseInt(val.target.value)
    // }
    // gownPct.setAttribute(
    //   'value',
    //   DEFAULT_INTERVENTION_PARAMETERS.gownPct.toString()
    // )

    handwashPct.onchange = val => {
      DEFAULT_INTERVENTION_PARAMETERS.handwashPct = parseInt(val.target.value)
    }
    handwashPct.setAttribute(
      'value',
      DEFAULT_INTERVENTION_PARAMETERS.handwashPct.toString()
    )

    socialDistancePct.onchange = (val) => {
      DEFAULT_INTERVENTION_PARAMETERS.socialDistancePct = parseInt(val.target.value)
    }
    socialDistancePct
      .setAttribute('value', DEFAULT_INTERVENTION_PARAMETERS.socialDistancePct.toString())

    n95Pct.onchange = (val) => {
      DEFAULT_INTERVENTION_PARAMETERS.n95Pct = parseInt(val.target.value)
    }
    n95Pct.setAttribute(
      'value',
      DEFAULT_INTERVENTION_PARAMETERS.n95Pct.toString()
    )

    testFrequency.onchange = val => {
      DEFAULT_INTERVENTION_PARAMETERS.testFrequency = parseInt(val.target.value)
    }
    testFrequency.setAttribute(
      'value',
      DEFAULT_INTERVENTION_PARAMETERS.testFrequency.toString()
    )

    testPct.onchange = val => {
      DEFAULT_INTERVENTION_PARAMETERS.testPct = parseInt(val.target.value)
    }
    testPct.setAttribute(
      'value',
      DEFAULT_INTERVENTION_PARAMETERS.testPct.toString()
    )
  }

  sketch.draw = () => {
    sketch.background('white')
    balls.forEach(ball => {
      ball.checkState()
      ball.maybeTest()
      ball.checkCollisions({ others: balls })
      ball.move()
      ball.render()
    })
    updateCount()
  }
}, document.getElementById('canvas'))
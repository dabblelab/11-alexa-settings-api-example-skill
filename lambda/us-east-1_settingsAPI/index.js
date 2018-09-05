/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');
const momenttz = require('moment-timezone');
const moment = require('moment');
const APP_NAME = "Greeter"

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Hello there. Welcome to Alexa. you can say greet me!';
    const reprompt = 'Say greet me';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(reprompt)
      .withSimpleCard(APP_NAME, speechText)
      .getResponse();
  },
};

const GreetMeIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'GreetMeIntent';
  },
  async handle(handlerInput) {
    const { requestEnvelope, serviceClientFactory, responseBuilder } = handlerInput;

    let {deviceId} = requestEnvelope.context.System.device;
    const upsServiceClient = serviceClientFactory.getUpsServiceClient();
    const usertimeZone = await upsServiceClient.getSystemTimeZone(deviceId);
    const now = momenttz.utc();
    const localTime = now.tz(usertimeZone).format('h:mma');
    let speechText = `Your local time is ${localTime}`;

    speechText += calculateGreeting(localTime);

    return handlerInput.responseBuilder
    .speak(speechText)
    .withSimpleCard('Hello World', speechText)
    .getResponse();
    
  },
}

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const RequestLog = {
  process(handlerInput) {
    console.log(`REQUEST ENVELOPE = ${JSON.stringify(handlerInput.requestEnvelope)}`);
  },
};

const ResponseLog = {
  process(handlerInput) {
    console.log(`RESPONSE BUILDER = ${JSON.stringify(handlerInput)}`);
  },
};

function calculateGreeting(localTime){
  var currentTime = moment(localTime, 'h:mma');
  var morningTime = moment('4:00am', 'h:mma');
  var noonTime = moment('12:00pm', 'h:mma');
  var eveningTime = moment('4:00pm', 'h:mma');
  var nightTime = moment('8:00pm', 'h:mma');
  if(currentTime.isAfter(morningTime) && currentTime.isBefore(noonTime)){
    return " Good Morning";
  }
  else if(currentTime.isAfter(noonTime) && currentTime.isBefore(eveningTime)){
    return " Good Afternoon";
  }
  else if(currentTime.isAfter(eveningTime) && currentTime.isBefore(nightTime)){
    return " Good Evening";
  }
  else{
    return " Good Night";
  }
}
const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    GreetMeIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addRequestInterceptors(RequestLog)
  .addResponseInterceptors(ResponseLog)
  .addErrorHandlers(ErrorHandler)
  .withApiClient(new Alexa.DefaultApiClient())
  .lambda();


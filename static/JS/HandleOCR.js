var ScreenshotSubmission = document.getElementById("ScreenshotSubmission")
var ModalOpener = document.getElementById("Modal-Opener")
var SubmissionPrompt = document.getElementById("SubmissionPrompt")
var CroppieContainer = document.getElementById("croppie-basic")
var ColorVerification = document.getElementById("ColorVerification")
var VerificationSubmission = document.getElementById("FormSubmission")
var SuccessPage = document.getElementById("SuccessPage")
var FailurePage = document.getElementById("FailurePage")
var ErrorPage = document.getElementById("ErrorPage")
var OneTimeLoad = false

SubmissionPrompt.style.visibility = "hidden"

$("#Modal-Opener").off("click", StartPage)
$("#Modal-Opener").on("click", StartPage)

$(".RestartPage").off("click", ReloadPage)
$(".RestartPage").on("click", ReloadPage)

$(".Signup").off("click", OpenNetlify)
$(".Signup").on("click", OpenNetlify)

function OpenNetlify(){
  netlifyIdentity.open()
}
function ReloadPage(){
  location.reload()
}

function StartPage(){
  if(OneTimeLoad == false){
    OneTimeLoad = true
    if (netlifyIdentity.currentUser().id == undefined){
      NetlifySignup()
    }
    ScreenshotSubmission.addEventListener("change", ImageToURL);
    VerificationSubmission.addEventListener("click", SendToDatabase)
    document.getElementById("ImageCallback").addEventListener("click", ReviewImage)
  }
}
var ImageCallbackStorage = ""

function ImageToURL() {
    ScreenshotSubmission.style.visibility = "hidden"
    if (SubmissionPrompt.style.visibility == "hidden"){
      SubmissionPrompt.style.visibility = "visible"
    }
    SubmissionPrompt.style.visibility = "visible"
    const file = ScreenshotSubmission.files[0];
    const reader = new FileReader();
  
    reader.addEventListener("load", function () {
      // convert image file to base64 string
      SetCroppie(reader.result)
      ImageCallbackStorage = reader.result
    }, false);
  
    if (file) {
      reader.readAsDataURL(file);
    }
  }
function LogPercent(Log){
    if (Log.status == "recognizing text"){
        document.getElementById("TextOutput").innerText = `${(Log.progress * 100).toFixed(2)}% Done`
        if (Log.progress == 1){
          document.getElementById("TextOutput").innerText = ""
        }
    }
}

function NetlifySignup(){
  $("#SubmissionModal").modal("hide")
  ModalOpener.style.visibility = "hidden"
  
}

function ProcessSubmission(DataURL){
Tesseract.recognize(
    `${DataURL}`,
    'eng',
    { logger: m => LogPercent(m) }
  ).then(({ data: { text } }) => {
    var TextArray = text.split(`\n`)
    FormatSubmission(TextArray)
  })
}
var SubmissionArray = []
function FormatSubmission(Submission){
  var TempObj = []
  for (let i = 0; i < Submission.length; i++) {
    if (Submission[i] != "") {
      TempObj.push(Submission[i])
    }
  }
  TempObj = TempObj.join(" ")
  SubmissionArray.push(TempObj)
  if(SubmissionArray.length == 3){
    SendVerificaiton()
  }
}

var BasicResult = document.getElementById("basic-result")
var CroppieController = false
function SetCroppie(DataURL){
    $(function() {
        var basic = $('#croppie-basic').croppie({
          viewport: {
            width: 300,
            height: 100
          }
        });
        basic.croppie('bind', {
          url: `${DataURL}`
        });
        if (CroppieController == false){
          BasicResult.addEventListener("click", function(){
            basic.croppie("result",'base64').then(function(base64) {
              ChangePrompts()
              ProcessSubmission(base64)
          });
          })
          CroppieController = true
        }
      });
}

var i = 0
var PromptArray = ["Select Question","Select Answer","Select Category"]
function ChangePrompts(){
  if (i >= 2) {
    $("#SubmissionModal").modal("hide")
    SubmissionPrompt.innerText = PromptArray[2]
    SubmissionPrompt.style.visibility = "hidden"
    ScreenshotSubmission.style.visibility = "visible"
    ModalOpener.style.visibility = "hidden"
    CroppieContainer.innerHTML = ""
    CroppieContainer.className = ""
    i = 0
    return
  }else{
    SubmissionPrompt.innerText = PromptArray[i]
    i++
  }
}

var VerificationContainer = document.getElementById("SubmissionVerification")
var CategoryVerification = document.getElementById("CategoryVerification")
var QuestionVerification = document.getElementById("QuestionVerification")
var AnswerVerification = document.getElementById("AnswerVerification")
function SendVerificaiton(){
  CategoryVerification.value = SubmissionArray[0]
  QuestionVerification.value = SubmissionArray[1]
  AnswerVerification.value = SubmissionArray[2]
  VerificationContainer.style.visibility = "visible"
}

async function SendToDatabase(){
  var SendingData = []
  SendingData.Category = CategoryVerification.value
  SendingData.Question = 
  SendingData.Answer = 
  SendingData.Color = ColorVerification.value

	let response = await fetch("https://coinhuntworldtrivia.com/.netlify/functions/UploadQuestions", {
		body: JSON.stringify({
            Category: `${CategoryVerification.value}`,
            Question: `${QuestionVerification.value}`,
            Answer: `${AnswerVerification.value}`,
            Color: `${ColorVerification.value}`,
            UserID: `${netlifyIdentity.currentUser().id}`,
            UserEmail: `${netlifyIdentity.currentUser().email}`
        }),
    method: "POST"
	});
	if (response.status === 200){
		let data = await response.text()
    if (data == "Success"){
      VerificationContainer.style.display = "none"
      SuccessPage.style.display = "block"
      console.log(`The Process was an ${data}`)
    }else{
      if (data == "Failed. Already in Database"){
        VerificationContainer.style.display = "none"
        FailurePage.style.display = "block"
        console.log(data)
      }else{
        ErrorPage.style.display = "block"
        document.getElementById("ErrorCode").innerText = data
        console.log(`Unknown Data Callback: ${data}`)
      }
    }
	}
}

function ReviewImage() {
  document.getElementById("ImageReviewerObj").src = ImageCallbackStorage
}
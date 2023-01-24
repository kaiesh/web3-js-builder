(function(exports){
  var showToast = function(msg, classname){
    let all_toasts = document.getElementsByClassName("toast");
    let top_position;
    if (all_toasts.length > 0){
      top_position = (all_toasts[all_toasts.length - 1].offsetTop + all_toasts[all_toasts.length - 1].offsetHeight + 25)+"px";
    }
    let rand_id = Math.floor(Math.random()*1000);
    let t = document.createElement("DIV");
    t.id = "toast"+rand_id;
    t.innerHTML = msg;
    t.className = "toast "+classname;
    if (top_position) t.style.top = top_position;

    document.getElementsByTagName("body")[0].appendChild(t);
    t.addEventListener("mouseover", function(){
      t.classList.add("animpaused");
    });
    t.addEventListener("mouseout", function(){
      t.classList.remove("animpaused");
    });
    t.addEventListener("animationend", function(ev){
      if (ev.animationName == "slide-in"){
        t.parentElement.removeChild(t);
      }
    });
  };
  /*var checkHuman = function(){
    if (typeof grecaptcha == 'object' && grecaptcha != null && typeof grecaptcha.execute == "function"){
      setTimeout(function(){ grecaptcha.reset(); grecaptcha.execute(); },10);
    }else{
      setTimeout(checkHuman, 2000);
    }
  }
  var recapFn = function(captchaToken){
    let email = document.getElementById("emailaddress");
    let joinbtn = document.getElementById("joinnewsletter");
    ajax({
      "action": "joinsendinbluelist",
      "email": email.value,
      "token": captchaToken
    }).then(function(res){
      if (res.status == "ok"){
        showToast("We have sent you a confirmation message! Please check your mailbox!", "good");
        email.value = "";
      }else{
        showToast("There was an error adding you to the mailing list! The server said: "+res.msg, "bad");
      }
      joinbtn.disabled = false;
      joinbtn.src = joinbtn.original_src;
      email.disabled = false;
    }).catch(function(err){
      showToast("There was a problem adding you to the mailing list! Please try again later.", "bad");
      joinbtn.disabled = false;
      joinbtn.src = joinbtn.original_src;
      email.disabled = false;
    });
  };
  exports.recaptchaResult = recapFn;
  var enable_email_subscription_btn = function(){
    var joinbtn = document.getElementById("joinnewsletter");
    joinbtn.addEventListener("click", function(){
      if (joinbtn.disabled){ return false; }

      let email = document.getElementById("emailaddress");
      if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email.value)){
        email.disabled = true;
        joinbtn.disabled = true;
        joinbtn.original_src = joinbtn.src;
        joinbtn.src = "https://assets.jedstar.space/img/sv_loading_lo.gif";
        checkHuman();
      }else{
        showToast("Your email address does not appear correct. Please check it and try again!", "bad");
      }

    })
  };
  shield("https://www.google.com/recaptcha/api.js", enable_email_subscription_btn, "head", "script", 0);*/

  //reformat code blocks
  for (let i = 0; i < document.getElementsByClassName("code").length; i++){
    document.getElementsByClassName("code")[i].innerHTML = document.getElementsByClassName("code")[i].innerHTML.replaceAll(" ","&nbsp;").replaceAll("\n", "<br/>") 
  }

  let toggleROView = function(e){
    let tgt1 = document.getElementById("lbl-"+this.dataset["prefix"]+"-network");
    let tgt2 = document.getElementById(this.dataset["prefix"]+"-network");
    if (this.checked){
      tgt1.classList.remove("hide");
      tgt2.classList.remove("hide");
    }else{
      tgt1.classList.add("hide");
      tgt2.classList.add("hide");
    }
  };

  let abiml = document.getElementById("abitemplate").innerHTML;
  let abicount = 1;
  let abiform = document.getElementById("abi-form");
  let firstabi = document.createElement("DIV");
  firstabi.classList.add("abifields");
  firstabi.innerHTML = abiml;
  abiform.appendChild(firstabi);
  document.getElementById("abi1-ro").addEventListener("click", toggleROView)

  document.getElementById("addmore").addEventListener("click", function(){
    abicount++;
    let newabi = document.createElement("DIV");
    newabi.classList.add("abifields");
    newabi.innerHTML = abiml.replaceAll("abi1", "abi"+abicount);
    abiform.appendChild(newabi);
    document.getElementById("abi"+abicount+"-ro").addEventListener("click", toggleROView)
  });

  document.getElementById("build").addEventListener("click", function(){
    let starttime = new Date().getTime();
    let abi_arr = [];
    for (let i = 1; i <= abicount; i++){
      if (document.getElementById("abi"+i+"-name").value.length > 0 && document.getElementById("abi"+i+"-ct").value.length > 0 && document.getElementById("abi"+i+"-url").value.length > 0){
        abi_arr.push({
          name: document.getElementById("abi"+i+"-name").value,
          address: document.getElementById("abi"+i+"-ct").value,
          abi_url: document.getElementById("abi"+i+"-url").value,
          ro_network: document.getElementById("abi"+i+"-ro").checked ? document.getElementById("abi"+i+"-network").options[document.getElementById("abi"+i+"-network").selectedIndex].id : 0
        });
      }else{
        console.error("Ignoring incomplete spec for entry "+i);
      }
    }
    builder(
      abi_arr, 
      { 
        web3network: document.getElementById("abi-network").options[document.getElementById("abi-network").selectedIndex].id * 1,
        infuraID: document.getElementById("infura_id").value.trim().length > 0 ? document.getElementById("infura_id").value : null
      }
    ).then(function(output){
      document.getElementById("builder_out").value = output;
    });
  })
})(window)

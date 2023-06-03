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
  // let abiform = document.getElementById("abi-form");
  let abiform = document.getElementById("card-container");
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
  });

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function demoscript(caller){
    caller.disabled = true;
    let demoarr = [
      {"elem": "#abi-network", "scale": 1.25, "delay": 1},
      {"elem": "#infura_id", "scale": 1.25, "delay": 1, "text":"abcdefg"},
      {"elem": "#abi1-name", "scale": 1.25, "delay": 1, "text":"MyContract"},
      {"elem": "#abi1-ct", "scale": 1.25, "delay": 1, "text":"0x1234567890"},
      {"elem": "#abi1-url", "scale": 1.25, "delay": 1, "text":'[{\n\t"inputs": [],\n\t"name": "numberOfMints",\n\t"outputs": [\n\t\t{\n\t\t"internalType": "uint256",\n\t\t"name": "",\n\t\t"type": "uint256"\n\t\t}],\n\t"stateMutability": "view",\n\t"type": "function"\n}]'},
      {"elem": "#build", "scale": 1.25, "delay": 1, "event":"click"},
      {"elem": "#builder_out", "scale": 1.25, "delay": 1},
    ];
    for (let i=0; i < demoarr.length; i++){
      let tgt = document.querySelector(demoarr[i]["elem"]);
      tgt.scrollIntoView({behavior: "smooth", block: "center"});
      tgt.style.transition = "1s ease";
      tgt.style.transform = "scale("+demoarr[i]["scale"]+")";
      await sleep(1000);
      if (demoarr[i]["text"] && demoarr[i]["text"].length > 0){
        let perCharDuration = Math.round(2000 / demoarr[i]["text"].length);
        perCharDuration = Math.max(perCharDuration, 1);
        for (let j=0; j <= demoarr[i]["text"].length; j++){
          tgt.value = demoarr[i]["text"].substring(0, j);
          if (tgt.tagName.toUpperCase() == "TEXTAREA"){
            tgt.scrollTop = tgt.scrollHeight;
          }
          await sleep(perCharDuration);
        }
      }
      if (demoarr[i]["event"]){
        setTimeout(function(){
          tgt[demoarr[i]["event"]]();
        },10);
      }
      tgt.style.transform = "scale(1)";
      await sleep(demoarr[i]["delay"]*1000);
      tgt.style.transition = "";
    }
    caller.disabled = false;
  }
  document.getElementById("seedemo").addEventListener("click", function(){
    demoscript(this);
  });
})(window)

const fs = require("fs");
const path = require("path");
const axios = require("axios");
const OUTPUT = "../kiosk";
const DOGS_DIR = path.join(OUTPUT, "dogs");
const shelterId = "672d68c821fd26b8a1017fa3";
const LOGO_URL = "https://lirp.cdn-website.com/5e4917b7/dms3rep/multi/opt/Daniel+Dog+Trainer+-+5+%283%29-1920w.PNG";

function setupFolders(){
    if(!fs.existsSync(OUTPUT))
        fs.mkdirSync(OUTPUT);

    if(fs.existsSync(DOGS_DIR)){
        fs.rmSync(DOGS_DIR,{recursive:true, force:true, maxRetries:10, retryDelay:300});
    }

    fs.mkdirSync(DOGS_DIR,{
        recursive:true
    });

    for(const f of ["index.html", "logo.png"]){
        const p = path.join(OUTPUT,f);
        if(fs.existsSync(p))
            fs.unlinkSync(p);
    }
}

async function download(url,file){
    const r = await axios.get(url,{
        responseType:"arraybuffer"
    });

    fs.writeFileSync(file,r.data);
}

function makeDogPage(animal,images){
	return `
	<!DOCTYPE html>
	<html>
		<head>
			<meta charset="UTF-8">
			<title>${animal.animal_name}</title>
			<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
			<link rel="icon" type="image/x-icon" href="../../logo.png">
			
			<style>
				*{
					box-sizing:border-box;
					user-select:none;
					-webkit-user-select:none;
				}
				html,body{
					margin:0;
					height:100%;
					width:100%;
					overflow:hidden;
					background:#030607;
					color:white;
					font-family:Arial,Helvetica,sans-serif;
				}
				.page{
					height:100vh;
					width:100vw;
					display:flex;
					flex-direction:column;
					padding:25px;
				}
				.header{
					height:20vh;
					display:grid;
					grid-template-columns:220px 1fr 170px 80px;
					align-items:center;
					gap:20px;
					z-index:50;
				}
				.content{
					flex:1;
					display:grid;
					grid-template-columns:auto 1fr;;
					min-height:0;
					gap:20px;
				}
				.logo{
					height:180px;
					object-fit:contain;
					margin-left:100px;
				}
				.title{
					text-align:center;
					font-weight:bold;
					white-space:nowrap;
					overflow:hidden;
					font-size:72px;
				}
				.qr{
					background:white;
					padding:8px;
					width:max-content;
					justify-self:center;
				}
				.close{
					width:70px;
					height:70px;
					border-radius:50%;
					background:#222;
					display:flex;
					align-items:center;
					justify-content:center;
					font-size:50px;
					cursor:pointer;
					z-index:999;
				}
				.photoArea{
					position:relative;
					display:flex;
					align-items:center;
					justify-content:center;
					aspect-ratio:1 / 1;
					height:75vh;
				}
				
				.photo {
					display: block;
					overflow: hidden;
					width: 90%;
					height: 70vh;
					max-width: 90%;
					max-height: 70vh;
					object-fit: cover;
					filter: drop-shadow(0px 0px 25px #7fdcff);
					border-radius:60px;
				}   
				
				.arrow{
					position:absolute;
					top:50%;
					transform:translateY(-50%);
					font-size:90px;
					cursor:pointer;
					user-select:none;
					z-index:10;
				}
				.left{
					left:0;
				}
				.right{
					right:0;
				}
				.info{
					padding:20px;
					overflow:hidden;
					display:flex;
					flex-direction:column;
				}
				.meta{
					font-size:28px;
				}
				.bio{
					flex:1;
					overflow:hidden;
				}
			</style>
		</head>
		
		<body>
			<div class="page">
				<div class="header">
					<img class="logo" src="../../logo.png">
					<div class="title">
						${animal.animal_name}
					</div>
					<div id="qr" class="qr"></div>
					<div class="close" onclick="goHome()">✕</div>
				</div>
				<div class="content">
					<div class="photoArea">
						<div class="arrow left" onclick="prev()">❮</div>
						<img id="photo" class="photo">
						<div class="arrow right" onclick="next()">❯</div>
					</div>
					<div class="info">
						<div class="meta">
							<h2>${animal.breed || ""}</h2>
							<p>${animal.gender || ""} ${animal.age || ""}</p>
						</div>
						<div id="bio" class="bio">
							${animal.description || ""}
						</div>
					</div>
				</div>
			</div>
			
			<script>
				const photos =
				${JSON.stringify(images)};
				let index=0;
				function show(){
					document.getElementById("photo").src = photos[index];
				}
				
				function next(){
					index++;
					if(index>=photos.length)
					index=0;
					show();
				}
				
				function prev(){
					index--;
					if(index<0)
						index=photos.length-1;
					show();
				}

				function goHome(){
					location.href="../../index.html";
				}
				
				new QRCode( 
					document.getElementById("qr"),{text:"${animal.adoption_url}", width:130, height:130});
							
				function fitTextWidth(el,max,min){
					let size=max;
					el.style.fontSize=size+"px";
					while(el.scrollWidth > el.clientWidth &&	size > min){
						size--;
						el.style.fontSize=size+"px";
					}
				}
				function fitTextHeight(el,max,min){
					let size=max;
					el.style.fontSize=size+"px";
					while(el.scrollHeight > el.clientHeight &&	size > min){
						size--;
						el.style.fontSize=size+"px";
					}
				}
				
				fitTextWidth(document.querySelector(".title"),72,20);
				fitTextHeight(document.querySelector(".bio"),34,12);
				
				let timer;
				function resetTimer(){
					clearTimeout(timer);
					timer=setTimeout(goHome,60000);
				}
							
				["click","mousemove","touchstart","keydown"].forEach(e=>{
					document.addEventListener(e,resetTimer);
				});
				
				resetTimer();
				show();
			</script>
		</body>
	</html>
	`;
}

function makeHome(cards){
return `
<!DOCTYPE html>
<html>
	<head>
	<meta charset="UTF-8">
	<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
	<link rel="icon" type="image/x-icon" href="logo.png">
	
	<style>
		*{box-sizing:border-box;}
			html,body{
			margin:0;
			height:100%;
			overflow:hidden;
			background:#030607;
			color:white;
			font-family:Arial,Helvetica,sans-serif;
		}

		.page{
			height:100vh;
			display:flex;
			flex-direction:column;
			padding:25px 35px;
		}

		.header{
			height:140px;
			display:grid;
			grid-template-columns:220px 1fr 160px;
			align-items:center;
			gap:20px;
			flex-shrink:0;
		}

		.logo{
			height:150px;
			object-fit:contain;
			margin-left:100px;
		}

		.title{
			text-align:center;
			font-size:72px;
			font-weight:bold;
		}

		.qr{
			background:white;
			border:10px;
			padding:10px;
			justify-self:end;
			margin-right:100px;
		}

		.carousel{
			flex:1;
			position:relative;
			overflow:hidden;
			display:flex;
			align-items:center;
			padding:0 90px;
			touch-action:none;
		}

		.track{
			display:flex;
			gap:25px;
			transition:transform .45s ease;
		}

		.card{
			box-shadow: 0px 0px 25px #7fdcff;
			width: calc((100vw - 220px - 90px - 100px + 10px) / 5);
			max-width:360px;
			min-width:260px;
			height:70vh;
			background:#2c3a3c;
			border-radius:20px;
			overflow:hidden;
			flex-shrink:0;
			display:flex;
			flex-direction:column;
			text-align:center;
			opacity:0;
			transform:scale(0);
			transform-origin:center center;
			transition:
				transform .45s ease,
				opacity .45s ease;
		}

		.card.active{
			margin-left:25px;
			margin-right:25px;
			opacity:1;
			transform:scale(1.08);
		}

		.card.inner{
			opacity:.45;
			transform:scale(1);
		}

		.card.outer{
			opacity:.25;
			transform:scale(.8);
		}

		.card img{
			width:100%;
			height:calc(70vh - 90px);
			object-fit:cover;
			pointer-events:none;
		}

		.name{
			flex:1;
			display:flex;
			align-items:center;
			justify-content:center;
			font-size:40px;
			font-weight:bold;
			padding:10px;
		}

		a,
		a:visited,
		a:hover,
		a:active{
			color:white;
			text-decoration:none;
		}

		.nav{
			position:absolute;
			top:50%;
			transform:translateY(-50%);
			width:100px;
			height:100px;
			border-radius:50%;
			background:#2c3a3c;
			display:flex;
			align-items:center;
			justify-content:center;
			font-size:65px;
			z-index:99;
			cursor:pointer;
		}

		.left{left:15px;}
		.right{right:15px;}

		</style>
	</head>

	<body>
		<div class="page">
			<div class="header">
				<img class="logo" src="logo.png">
				<div class="title">
					ADOPTABLE DOGS
				</div>
				<div id="homeqr" class="qr"></div>
			</div>

			<div class="carousel">
				<div class="nav left" onclick="move(-1)">❮</div>
				<div id="track" class="track">
					${cards.join("\n")}
				</div>
				<div class="nav right" onclick="move(1)">❯</div>
			</div>
		</div>

	<script>
		new QRCode(document.getElementById("homeqr"),{
			text:"http://www.fishysfriendsrescue.com",
			width:120,
			height:120
		});

		const track=document.getElementById("track");
		function updateActive(){
			let cards=document.querySelectorAll(".card");
			cards.forEach(c=>{
				c.classList.remove("active");
				c.classList.remove("inner");
				c.classList.remove("outer");
			});
			cards[0].classList.add("outer");
			cards[1].classList.add("inner");
			cards[2].classList.add("active");
			cards[3].classList.add("inner");
			cards[4].classList.add("outer");
		}
		
		function move(dir){
			let card = document.querySelector(".card");
			let step = card.offsetWidth+25;

			let cards = document.querySelectorAll(".card");

			cards.forEach(c=>{
				c.classList.remove("active");
				c.classList.remove("inner");
				c.classList.remove("outer");
			});

			if(dir > 0){
				cards[1].classList.add("outer");
				cards[2].classList.add("inner");
				cards[3].classList.add("active");
				cards[4].classList.add("inner");
				cards[5].classList.add("outer");

			}else{
				cards[0].classList.add("inner");
				cards[1].classList.add("active");
				cards[2].classList.add("inner");
				cards[3].classList.add("outer");
			}

			// slide
			track.style.transition = "transform .45s ease";
			track.style.transform = "translateX("+(-step*dir)+"px)";

			setTimeout(()=>{
				if(dir>0){
					track.appendChild(
					track.firstElementChild
					);
				}
				else {
					track.insertBefore(
						track.lastElementChild,
						track.firstElementChild
					);
				}

				track.style.transition="none";
				track.style.transform="translateX(0)";
				updateActive();
			},450);
		}

		updateActive();

		let startX=0;
		let startY=0;

		const carousel=document.querySelector(".carousel");

		carousel.addEventListener("pointerdown",e=>{
			startX=e.clientX;
			startY=e.clientY;
		});

		carousel.addEventListener("pointerup",e=>{
			let dx=e.clientX-startX;
			let dy=e.clientY-startY;
			if(Math.abs(dx)>50 && Math.abs(dx)>Math.abs(dy)){
				e.preventDefault();
				if(dx<0){
					move(1);
				}
				else{
					move(-1);
				}
			}
		});

		function fitText(el,max,min){
			let size=max;
			el.style.fontSize=size+"px";
			while(el.scrollWidth > el.clientWidth && size > min){
				size--;
				el.style.fontSize=size+"px";
			}
		}
		
		document.querySelectorAll(".name")
		.forEach(name=>{
			fitText(name,72,20);
		});

		let idleTimer;
		let autoTimer;
		function resetIdle(){
			clearTimeout(idleTimer);
			clearInterval(autoTimer);
			idleTimer = setTimeout(()=>{
				autoTimer = setInterval(()=>{
					move(1);
				},5000);
			},25000);
		}
		[
			"pointerdown",
			"pointermove",
			"keydown",
			"wheel"
		].forEach(event=>{
			document.addEventListener(
				event,
				resetIdle
			);
		});
		resetIdle();



		let taps = 0;
		let lastTap = 0;

		function kioskEscape(x, y) {
			if (x < 100 && y < 100) {
				const now = Date.now();

				taps = (now - lastTap < 1000) ? taps + 1 : 1;
				lastTap = now;

				console.log("escape taps:", taps);

				if (taps >= 7) {
					taps = 0;
					fetch("http://localhost:3001/exit");
				}
			}
		}

		document.addEventListener("touchstart", e => {
			kioskEscape(e.touches[0].clientX, e.touches[0].clientY);
		});

		document.addEventListener("click", e => {
			kioskEscape(e.clientX, e.clientY);
		});
		
		</script>
		
	</body>
</html>
`;
}

function makeHelper(){

	const toolsDir = "../kiosk-tools";

	if(!fs.existsSync(toolsDir)){
		fs.mkdirSync(toolsDir);
	}

	fs.writeFileSync(
		path.join(toolsDir,"kiosk-control.js"),
		`
		const http = require("http");
		const { exec } = require("child_process");

		http.createServer((req,res)=>{

			res.setHeader("Access-Control-Allow-Origin","*");

			if(req.url === "/exit"){
				exec("pkill chromium");
			}

			res.end("ok");

		}).listen(3001);

		console.log("Kiosk control running");
		`
	);
}


function makeLauncher(){
	fs.writeFileSync(
		"../start-kiosk.sh",
		`
		#!/bin/bash
		cd /opt/ffrkiosk/kiosk
		node /opt/ffrkiosk/kiosk-tools/kiosk-control.js &
		npx serve -l 3000 &
		sleep 3
		chromium --kiosk --no-first-run --no-default-browser-check http://localhost:3000
		`
		);

	fs.chmodSync("../start-kiosk.sh",0o755);
}


async function main(){
	setupFolders();
	makeHelper();
	makeLauncher();
	console.log("Downloading logo...");

	await download(LOGO_URL, path.join(OUTPUT,"logo.png"));

	console.log("Fetching animals...");

	const res =
	await axios.post(
		`https://adopt.animalsfirst.com/get-animals/${shelterId}?page=1&species=dog`,
		{
			filters:{},
			search:"",
			display:"grid",
			status:""
		});

	const animals=res.data.data;

	console.log(`Found ${animals.length} dogs`);

	let cards=[];

	for(const [i,animal] of animals.entries()){
		const id=animal._id.$oid;
		console.log(`[${i+1}/${animals.length}] Fetching ${animal.animal_name}`);
		const folder=path.join(DOGS_DIR,id);
		const imgDir=path.join(folder,"images");
		fs.mkdirSync(imgDir,{recursive:true});
		animal.adoption_url = `https://adopt.animalsfirst.com/animal/${shelterId}/${id}`;
		let imgs=[];
		
		for(let j=0;j<animal.photos.length;j++){
			console.log(`   Photo ${j+1}/${animal.photos.length}`);
			const url = `https://animalsfirstprod.s3.amazonaws.com/${shelterId}/${id}/images/${animal.photos[j].filename}`;
			const file = `${j+1}.jpg`;
			await download(url, path.join(imgDir,file));

			imgs.push(`${id}/images/${file}`); //array of image locations
		}

		fs.writeFileSync(path.join(folder,"index.html"),makeDogPage(animal,imgs));

		cards.push(`
			<a href="dogs/${id}/index.html">
				<div class="card">
					<img src="dogs/${id}/images/1.jpg">
					<div class="name">
						${animal.animal_name}
					</div>
				</div>
			</a>
		`);
	}

	fs.writeFileSync(path.join(OUTPUT,"index.html"),makeHome(cards));

	console.log("Kiosk generated.");
}

main().catch(console.error);
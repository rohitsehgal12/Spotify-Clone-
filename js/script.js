console.log("hello")
function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}
let currentsong = new Audio();
let songs;
let currfolder;




async function getsongs(folder) {
    currfolder = folder;
    let a = await fetch(`public/songs/ncs/list.json`);
    let response = await a.text();
    console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    // console.log(as)
    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1]);
        }

    }
    // show all the song in the playlist
    let songUL = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUL.innerHTML = ""
    for (const song of songs) {

        songUL.innerHTML = songUL.innerHTML + `<li>
        
                           <img class="invert" src="music.svg" alt="">

                           <div class="info">
                               <div class="width">${song.replaceAll("%20", " ")}</div>         
                               <div class="width">Music</div>
                           </div>
                           <div class="playnow">
                               <span>Play Now</span>
                               <img class="invert" src="img/play.svg" alt="">
                           </div>
                       </li>` ;
    }


    // attach an event listeiner to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playmusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    })
      return songs;
}
const playmusic = (track, pause = false) => {
    // let audio = new Audio("/song/" + track) 
    currentsong.src = `/${currfolder}/` + track
    if (!pause) {
        currentsong.play()
        play.src = "img/pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}
async function displayalbum() {
    let a = await fetch(`/songs/`);
    let response = await a.text();
    // console.log(response)
    let div = document.createElement("div")
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a")
    // console.log(anchors)
    let cardContainer = document.querySelector(".cardContainer")

    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];


        // console.log(e.href)
        if (e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0];
            // console.log(folder)
            // get the meta data of the folder
            let a = await fetch(`/songs/${folder}/info.json`);
            let response = await a.json();
            // console.log(response)
            cardContainer.innerHTML = cardContainer.innerHTML + `  <div data-folder="${folder}"="" class="card">
                    <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px"
                            fill="#000000">
                            <path
                                d="m380-300 280-180-280-180v360ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z" />
                        </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>`

        }
    }

    // Load the playlist whenever card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            // console.log("Fetching Songs")
            songs = await getsongs(`song/${item.currentTarget.dataset.folder}`);

           playmusic(songs[0]);
        })
    })

}

async function main() {

    // get the list of all the songs
    await getsongs("/public/songs/ncs/")
    playmusic(songs[0], true)
    // console.log(songs);

    // display all the album 
   await displayalbum()



    // Attach event listener to play next previou
    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "img/play.svg"
        }
    })

    // listen for time update event
    currentsong.addEventListener("timeupdate", () => {
        console.log(currentsong.currentTime, currentsong.duration);
        document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentsong.currentTime)}/${secondsToMinutesSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"
    })
    //    add event listener to seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let precent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = precent + "%";
        currentsong.currentTime = ((currentsong.duration) * precent) / 100;
    })
    // add event listener for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    // add event listener for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-120%"
    })



    // add event listener to previous 
    previous.addEventListener("click", () => {

        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playmusic(songs[index - 1]);
        }
    })
    // add event listener to  next
    next.addEventListener("click", () => {

        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);
        if ((index + 1) < songs.length) {
            playmusic(songs[index + 1]);
        }

    })

    //    add eventlistener to volume

    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to", e.target.value, "/ 100")
        currentsong.volume = parseInt(e.target.value) / 100;

    })

    // Add event listener to mute the track
    document.querySelector(".volume>img").addEventListener("click", e => {
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            currentsong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            currentsong.volume = .10;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }

    })



}
main()

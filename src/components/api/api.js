import monkeyNft from "../assets/monkey.jpg";
import monkeyNft1 from "../assets/monkey1.jpg";
import monkeyNft2 from "../assets/monkey2.jpg";
import monkeyNft3 from "../assets/monkey3.jpg";
import monkeyNft4 from "../assets/monkey4.jpg";
import monkeyNft5 from "../assets/monkey5.jpg";
import monkeyNft6 from "../assets/monkey6.jpg";
import monkeyNft7 from "../assets/monkey7.jpg";
import vipAudio from "../audio/vip.mp3";
import WinningSpeech from "../audio/winningspeeach.mp3";
import Game from "../audio/game.mp3";
import Wavy from "../audio/wavy.mp3";

const apiData = [
    {id: 1,
       beatType: "Vip Rahn",
       beatAudio: vipAudio,
       beatImage: monkeyNft,
       by: "Sajn Bendre"
    },
    {id: 2,
       beatType: "Winning Speech",
       beatAudio: WinningSpeech,
       beatImage: monkeyNft1,
       by: "Karan Aujla"
       },
    {id: 3,
       beatType: "Game",
       beatAudio: Game,
       beatImage: monkeyNft2,
       by: "Siddhu Moosewala"
       },
    {id: 4,
        beatType: "Wavy",
        beatAudio: Wavy,
        beatImage: monkeyNft3,
        by: "Karan Aujla"
    },
    {id: 5,
      beatType: "Drill Shit",
      beatAudio: vipAudio,
      beatImage: monkeyNft4
   },
   {id: 6,
      beatType: "खिडकी",
      beatAudio: vipAudio,
      beatImage: monkeyNft5
      },
   {id: 7,
      beatType: "सत्य",
      beatAudio: vipAudio,
      beatImage: monkeyNft6
      },
   {id: 8,
       beatType: "अमरन",
       beatAudio: vipAudio,
       beatImage: monkeyNft7
   },
];

export default apiData;

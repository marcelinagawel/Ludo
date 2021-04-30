import { gierka } from "./akcja_glowna.js"
import { dane_konf } from "./dane_konf.js"

class wynik_kostki {

  ustaw_na_kostce_oczka(value) {

    if (value != null) {                          //jak cos jest wylosowane
      this.kostka.src = `/img/${value}.png`    //ustaw numerek kostki jako zdjecie


      if (this.syntezator) {                    //mowienie syntezatora

        var glos = new SpeechSynthesisUtterance(`${value}`) //co ma powiedziec -> wartosc kostki
        glos.lang = "pl-PL"                     //w jakim jezyku mowi
        // var voices = window.speechSynthesis.getVoices()
        // glos.voice = voices[1]                 //angielski


        this.syntezator = false                 //nie moze teraz mowic
        this.gada.speak(glos);          //mow
      }
    }

    else this.pusta_kostka()                    //jak nie ma wartosci kostka to niech bedzie pusta
  }




  rzuca_kostke() {
    var wynik_kostki = "rzut_kostki"          //zapisz wynik kostki

    var dane_kostki = new dane_konf(null, null, wynik_kostki, null)
    dane_kostki.dynamiczne_polaczenie()         //wrzuc ja do dynamicznego
  }




  pusta_kostka() {
    this.kostka.src = "/img/empty.png"     //wyczysc kostke -> pusta
    this.syntezator = true                    //juz mozna mowic
  }




  constructor(wynik_kostki) {                 //zapisz dane konstruktora

    this.kostka = document.querySelector(".kostka")     //kostka z htmla

    this.syntezator = true                   //domyslnie gada

    this.gada = window.speechSynthesis
  }
}



window.addEventListener("DOMContentLoaded", async () => {

  var jakich_mamy_tera_graczy = "/pobranie_graczy"          //sprawdz jakich mamy teraz graczy i wez ich

  gierka.pole_gry()                                //wsadz canvasa w koncu

  dane_gierka.kostka = new wynik_kostki()                //zrob nowy wynik kostki
  var zapytanie_ludzie = new dane_konf(null, null, jakich_mamy_tera_graczy)    //zapytanie o ludzikow




  await zapytanie_ludzie.dynamiczne_polaczenie().then((value) => {

    dane_gierka.tablica_ludzi = value.players               //wrzuc do danych o gierce i do tablicy wszystkich ktorzy teraz graja

    gierka.users = value.players                    //wrzuc tez do kreatora

    dane_gierka.gracz = value.gracz.nickname                //jak sie nazywa gracz aktualizacja



    dane_gierka.tablica_ludzi.forEach((element) => {

      dane_gierka.nowy_typo(element)                     //info o kazdym graczu tworze
    })


    dane_gierka.pioneczki()
    dane_gierka.czas_gry()

  })
})



class Player {

  jakie_pioneczki(wszystkie_pionki) {                 //aktualizuj jakie mam pionki wszystkimi pionkami
    this.jakie_mam_pionki = wszystkie_pionki
  }


  czy_ok_ruch(istnieje, wynik_rzutu) {                //jak jest dany gracz, jest jego kolej na rzut, i cos wyrzucil
    if (this.nickname == istnieje && this.nickname == this.aktualny_krol && wynik_rzutu != null) {

      //pozwol na takie przesuniecie
      this.jakie_mam_pionki.forEach((index) => index.ok_ruch(wynik_rzutu));
    }
  }


  nie_ok_ruch() {

    this.jakie_mam_pionki.forEach((index) => index.posprzataj_po_kolejce()) //nie pozwalaj na dalszy ruch
  }


  brak_losowania() {

    this.button.style.visibility = "hidden"           //ukryj guzik losowania jak nie kolej danego gracza
    this.button.removeEventListener("click", this.rzuca_kostke) //nasluchuj czy inni gracze rzucaja dalej, czekaj na kolej
  }



  rzuca_kostke = () => {

    this.wynik_kostki.rzuca_kostke()              //rzuc i wylosuj wynik
    this.brak_losowania()                       //po losowaniu blokada nie losuj dalej
  };



  nowy_wynik() {
    this.wynik_kostki = new wynik_kostki()        //ustaw nowy wynik kostki
  }

  get a_ktoz_to_gral() {
    return this.nickname                        //a ktoz to gral
  }




  ok_losowanie(istnieje, wynik_rzutu) {

    //jak jest dany gracz, jest jego kolej na rzut i ma potrzebe wylosowania czegos teraz
    if (this.nickname == istnieje && this.nickname == this.aktualny_krol && wynik_rzutu == null) {

      this.button.style.visibility = "visible"      //pokaz guzik  !!!!
      this.jaki_czas.style.visibility = "visible"       //i czas    !!!!

      this.button.addEventListener("click", this.rzuca_kostke)  //daj listener na klikniecie czyli juz wylosowane
    }

    else {

      this.button.style.visibility = "hidden"   //jak wylosowal albo nie jego kolej to schowaj button
      this.jaki_czas.style.visibility = "hidden"    //i czas bo pokazuje 00:59 a my tego nie chcemy

      this.button.addEventListener("click", this.rzuca_kostke)  //daj listener na klikniecie czyli juz wylosowane
    }
  }



  ile_jeszcze(time) {

    this.jaki_czas.style.visibility = "visible"     //czas jest ogolnie pokazany
    this.jaki_czas.innerText = time                 //ustaw mu tekst jako czas 


    if (time == 0) {                            //koniec czasu (minuta minela)

      this.button.style.visibility = "hidden"     //pookaz guzik nastepnemu -> ukryj
      this.jaki_czas.style.visibility = "hidden"    //czas tez ukryj
    }
  }



  constructor(nickname, color, lolo, jaki_czas, button, aktualny_krol) {
    this.nickname = nickname
    this.color = color

    this.aktualny_krol = aktualny_krol            //krol i jego ruch

    this.wynik_kostki = null
    this.jakie_mam_pionki = []

    this.lolo = lolo

    this.jaki_czas = jaki_czas
    this.button = button

    this.nowy_wynik();
  }
}




var dane_gierka = {

  pioneczki() {
    var wez_pioneczki = "/pionki"                         //wez swoje pioneczki 

    var zapytanie_ludzie = new dane_konf(null, null, wez_pioneczki) //gdzie sa pioneczki info

    zapytanie_ludzie.dynamiczne_polaczenie().then((value) => {      //dynamicznie te pioneczki

      if (this.koncowka == [] || JSON.stringify(this.koncowka) != JSON.stringify(value)) { //ostatnie miejsce

        this.koncowka = value                           //ustaw koncowke jako wartosc

        gierka.piondo = value                        //pionki miejsce na planszy jako wartosc
        gierka.dorysuj()                       //plansza aktualizacja
      }
    });
  },



  kogo_pionki(wszystkie_pionki) {                 //znajdz kogo pionki z wszystkich pionkow

    this.pionek_gracza.forEach((index, c) => {      //dla kazdego pionka po kolei
      var no_i_kogo_to_jest = []                      //zrob tablice kogo to beda pionki wgl          


      wszystkie_pionki.forEach((item, counter) => {

        if (item.kogo_to == index.a_ktoz_to_gral) {     //jesli pionek kogos sie zgadza z granym
          no_i_kogo_to_jest.push(item)                //dodaj do tablicy
        }

      })


      index.jakie_pioneczki(no_i_kogo_to_jest)            //zaktualicuj sprawe
    });
  },




  tablica_ludzi: [],
  gracz: null,
  ostatni_gracz: null,

  pionek_gracza: [],
  ostatnio_wylosowana: null,
  kostka: null,

  koncowka: [],




  czas_gry() {

    var czas_gry = "/rowno_czas"                        //wez czas gry

    var kolejka = new dane_konf(null, null, czas_gry, null) //jaka jest kolejka gry


    kolejka.dynamiczne_polaczenie().then((value) => {       //dynamiczne polaczenie kolejki

      if (this.ostatnio_wylosowana != value.wynik_kostki || this.ostatni_gracz != value.movePlayer) {

        this.ostatnio_wylosowana = value.wynik_kostki         //nadpisz ostatni ruch kostka
        this.ostatni_gracz = value.ostatni_ruszony                 //i ostatniego ruszajacego sie gracza

        this.kostka.ustaw_na_kostce_oczka(value.wynik_kostki)   //ustaw wartosci wylosowane



        this.pionek_gracza.forEach((index) => {           //dla kazdego pionka

          index.ok_losowanie(

            this.pionek_gracza[value.movePlayer].a_ktoz_to_gral,    //jak ok losowanie to sprawdz kto gral
            value.wynik_kostki                    //i ustaw wynik kostki jako wartosc
          )
          index.nie_ok_ruch()                     //koniec ruszania sie



          if (value.wynik_kostki != null) {           //jak wylosowal liczbe

            index.czy_ok_ruch(

              this.pionek_gracza[value.movePlayer].a_ktoz_to_gral,  //jak moze sie ruszyc to 
              value.wynik_kostki                            //rusz sie o wynik kostki
            );

          }
        })

        this.pioneczki()
      }


      this.pionek_gracza[value.movePlayer].ile_jeszcze(value.odlicza_czas)    //ile jeszcze ma czasu

      setTimeout(function () { dane_gierka.czas_gry() }, 1000)              //sekundka mielenie

    });

    if (this.koncowka == []) {
      this.koncowka                               //jak puste to aktualizacja
    }
  },



  nowy_typo(user) {

    var template = document.querySelector("template").cloneNode(true)   //template z htmla
    var ktory_to_gracz = template.content.children[0]             //ustaw wg gracza kolorki maja sie zgadzac z tablicy

    ktory_to_gracz.style.backgroundColor = user.color             //ustaw mu tlo w jego kolorze do cssa
    var jak_sie_nazywasz = document.createTextNode(user.nickname)   //ustaw mu text jako imie



    ktory_to_gracz.querySelector("h1").appendChild(jak_sie_nazywasz)  //imie w znaczniku dynamicznie
    document.querySelector(".players").appendChild(template.content) //boxik z htmla


    this.pionek_gracza.push(                    //dodaj info o pionkach w tablicy

      new Player(                             //to juz jest nowy gracz

        user.nickname,
        user.color,
        ktory_to_gracz,

        ktory_to_gracz.querySelector("span"),     //czas
        ktory_to_gracz.querySelector("button"),     //losowanko

        this.gracz
      )
    );
  }
}

export default dane_gierka


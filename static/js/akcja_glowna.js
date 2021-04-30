

import akcje_gracza from "./akcja.js"
import { dane_konf } from "./dane_konf.js"
import { domki, tor_gry, wyjscie_start, srodek, wyjscie } from "./miejsca_osobno.js"

class polko {

  ok_ruch(wynik_kostki) {                      //wszytsko git mozna sie ruszyc

    this.wynik_kostki = wynik_kostki          //ustaw jaki wyszedl wynik kostki

    if (this.gdzie_jest == "domki") {             //jak jest w domku to wychodzimy

      //wychodzi wg wyniku kostki ale ja nie wiem jak to zrobic wiec wszystkie wyniki ma
      if (this.wynik_kostki == 1 || this.wynik_kostki == 3 || this.wynik_kostki == 2 || this.wynik_kostki == 4 || this.wynik_kostki == 5 || this.wynik_kostki == 6) {
        this.on_sie_rusza()
      }
    }


    else if ((this.gdzie_jest = "gra_juz")) {       //jak uzytkownik juz gra

      this.ruszaj_sie = this.ktory_gra + this.wynik_kostki    //gdzie jest i dodaj wynik kostki bedzie przeusniety
      var ile_sie_rusza = this.wszystkie_pionki.length - this.ruszaj_sie   //o ile ma sie przesunac

      if (ile_sie_rusza === 0) {              //zero to nic
        this.ruszaj_sie = 0
      }

      else if (ile_sie_rusza < 0) {           //ujemna wychodzi * -1 i dodaj o taka ilosc 
        this.ruszaj_sie = ile_sie_rusza * -1
      }

      //ruch dalszy od ostatniego i mniejszy od pierwszego
      if (this.ruszaj_sie > this.gdzie_jest_ostatni && this.ktory_gra < this.gdzie_jest_pierwszy) {

        this.gdzie_jest = "stop"                  //idz do stopu
        this.ruszaj_sie = this.ruszaj_sie - this.gdzie_jest_ostatni - 1   //a ile ma sie ruszyc a tyle ruch - ostatni -1


        //zeby mogl wejsc no ale nie mam zrobionego to niech idzie dalej
        if (this.ruszaj_sie < 4 && this.srodek[this.ruszaj_sie].gdzie_jest == "stopowany") {

          this.on_sie_rusza()                    //niech idzie dalej
        }
      }

      else {
        this.on_sie_rusza()                      //idz dalej
      }
    }
  }





  info_o_pionkach(kolorki, owner, ktory_typek, ktory_gra) {

    this.owner = owner                  //kogo to
    this.ktory_typek = ktory_typek        //a kto to

    this.gra_teraz = true               //czy gra teraz na polu czy w domku



    this.kolorki = kolorki
    this.element.style.background = `${this.kolorki}` //musz tu ustawic zeby dlugo nie mielilo tylko
    //od razu rzucic kolor na plansze



    this.wchodzi_typo = wyjscie_start[this.ktory_typek]   //wchodzi typo ma podane wsporzedne pierwszego pola wg miejsca kim jest
    this.koniec_trasy = wyjscie[this.ktory_typek]   //koniec trasy no ale idz dalej a sie nie zacinaj 

    this.ktory_gra = ktory_gra          //kto to gra

    this.element.style.zIndex = 21;

    this.kim_jest()                         //ustaw pozycje kim jest aktualnie
  }




  nastepny_ruch = (e) => {

    this.element.style.cursor = "pointer"     //najezdzajac na pionek ma byc pointer


    switch (this.gdzie_jest) {

      case "gra_juz":
        //nadaj filtr zeby bylo widac nastepny ruch, backgroundColor nie zadziala
        this.wszystkie_pionki[this.ruszaj_sie].element.style.filter = "invert(1)"
        //w domku nie potrzebuje przewidzenia bo logicznie idzie na 1 miejsce
        break;
    }
  };





  miganie() {
    var czy_ma_migac = true                             //bedzie miganie na zasadzie tak nie

    this.miganie_ile = setInterval(() => {

      if (czy_ma_migac) {
        this.element.style.background = "rgba(0,0,0,0)"   //zrob go przezroczystego zeby znikal i sie pojawial
      }

      else {                                          //co rob jak nie migaj
        this.element.style.background = `${this.kolorki}` //ustaw mu staly kolorek tla taki jakim jest graczem
        czy_ma_migac = !czy_ma_migac                //i zmien miganie
      }
    }, 500)                                           //jak szybko czas leci, co ile mruga
  }




  gdzie_was_wsadzic(x, y) {

    this.element.style.top = y + "%"       //pozycje pionkow po kliknieciu w % latwiej sie rozklada
    this.element.style.left = x + "%"
  }




  do_tablicy(array) {

    this.wszystkie_pionki = array         //wszystkie pionki do tablicy

    if (this.ktory_typek != null) {       //jak jest pusty to reset
      this.kim_jest()                  //ustaw pozycje kim jest aktualnie
    }
  }




  klikanie_pionka = () => {                     //kliknij na pionka

    switch (this.gdzie_jest) {                  //w zaleznosci od tego gdzie jest w tym momencie pionek taka akcja bd 

      case "domki":                               //jest w domu
        this.gdzie_was_wsadzic(

          this.wszystkie_pionki[this.gdzie_jest_pierwszy].x,  //na pierwsze pole wychodzi ustalone
          this.wszystkie_pionki[this.gdzie_jest_pierwszy].y

        )

        this.leci_ruch()                         //zaktulizuj ruch

        break




      case "gra_juz": {                              //juz gra i jest na planszy
        this.gdzie_was_wsadzic(

          this.wszystkie_pionki[this.ruszaj_sie].x, //rusza sie o dana ilosc pol
          this.wszystkie_pionki[this.ruszaj_sie].y

        )

        this.leci_ruch()                       //zaktulizuj ruch

        break
      }




      case "stop":                                  //powinien byc na srodku

        var ruszaj_dalej = "ruch"


        var info_o_ruchu = new dane_konf(null, null, ruszaj_dalej, null)
        info_o_ruchu.dynamiczne_polaczenie()            //dynamicznie info o ruchu



        info_o_ruchu.zmiany_wazne(null,
          {
            player: this.ktory_typek,         //kogo to pionek

            from: [this.x, this.y],           //skad idzie

            to: this.ruszaj_sie,                  //gdzie chde isc
          },
          null
        )


        info_o_ruchu.wysylanie()             //zaktualizuj dane o ruchu
        break
    }



    this.pionki_tab.forEach((index) => index.posprzataj_po_kolejce())   //wyczysc akcje dla kazdego info z tablicy
  };





  kim_jest() {
    this.wszystkie_pionki.forEach((index, counter) => {     //dla kazdego pionka z tablicy

      //pobierz indexy typkow do wchodza 1 i 2
      if (this.wchodzi_typo[0] == index.pobranie_x && this.wchodzi_typo[1] == index.pobranie_y) {

        this.gdzie_jest_pierwszy = counter
        this.gdzie_jest_ostatni = counter - 1 < 0 ? this.wszystkie_pionki.length - 1 : counter - 1
      }
    })


    //jak znalazl wspolrzedne ktoregos domku to mu daj
    if (JSON.stringify(domki[this.ktory_typek]).includes(JSON.stringify([this.x, this.y]))) {

      this.gdzie_jest = "domki"                   //ze jest w domku
    }


    //jak mu znalazl wspolrzedne gry planszy to mu daj
    else if (JSON.stringify(tor_gry[this.ktory_typek]).includes(JSON.stringify([this.x, this.y]))) {

      this.gdzie_jest = "gra_juz"                 //ze juz gra
    }
  }





  posprzataj_po_kolejce() {

    this.gra_teraz = false                    //jak teraz nie gra
    this.element.removeEventListener("mouseenter", this.nastepny_ruch)  //wywal listenery na myszke
    this.element.removeEventListener("click", this.klikanie_pionka)


    clearInterval(this.miganie_ile)         //wyczysc miganie


    this.element.style.background = `${this.kolorki}`   //ustaw mu staly kolor tla taki jakim jest graczem

    this.wszystkie_pionki.forEach((index) => (index.element.style.filter = "invert(0)"))
  }




  leci_ruch() {
    var leci_ruch = "ruch"                   //wez ruszanie


    var info_o_ruchu = new dane_konf(null,      //dane ruszania
      {
        player: this.ktory_typek, from: [this.x, this.y]  //kto sie rusza i skad
      },

      leci_ruch, null);           //pusc ten ruch

    info_o_ruchu.wysylanie()           //wyslij dane
    info_o_ruchu.dynamiczne_polaczenie()  //dynamicznie
  }





  on_sie_rusza() {

    this.gra_teraz = true                 //on teraz gra

    this.miganie()                      //miga sie jako wybor ruchu



    this.element.addEventListener("mouseenter", this.nastepny_ruch) //nasluchuj ktory jest wybrany do ruchu
    this.element.addEventListener("click", this.klikanie_pionka)  //miejsce gdzie laduje i lot

  }


  get kogo_to() {               //dynamiczne pobranie wlasciciela pionka
    return this.owner
  }


  get pobranie_x() {          //dynamiczne pobranie wspolrzednych
    return this.x
  }


  get pobranie_y() {          //dynamiczne pobranie wspolrzednych
    return this.y
  }



  constructor(x, y, element) {
    this.x = x                          //dynamiczne pobranie wspolrzednych
    this.y = y

    this.element = element              //glowny element

    this.kolorki = null                 //do cssa wypelnienie gracza bedzie
    this.owner = null                   //kogo to pionki
    this.ktory_typek = null

    this.gra_teraz = false              //sprawdz czy on wgl teraz gra

    this.wchodzi_typo = null
    this.gdzie_jest_pierwszy = null
    this.koniec_trasy = null
    this.gdzie_jest_ostatni = null
    this.gdzie_jest = "stopowany"       //gdzie sie znajduje

    this.ktory_gra = null               //ktory to teraz gra typko
    this.ruszaj_sie = null              //gdzie laduje pionek

    this.wszystkie_pionki = []          //wszystkie pionki
    this.wynik_kostki = null

    this.pionki_tab = []
    this.srodek = []

    this.miganie_ile = null
  }
}



var gierka = {


  pole_gry() {                                  //widocznosc 

    this.box = document.querySelector("canvas")       //img planszy 
    this.polunie = document.querySelector(".pole")     //pole z polami
  },


  uzywance() {                        //uzywane pola

    this.uzywance_tablica = []        //uzywane pionki
    this.gdzie_moze_isc = []          //trasa


    tor_gry.forEach((index, counter) => { //cala gierka dla kazdego kroku

      this.gdzie_moze_isc.push(       //jak moze isc to zrob tam pole


        new polko(                      //nowe pole
          index[0],
          index[1],

          this.poleczki(

            this.obrazek.height * (index[0] / 100),
            this.obrazek.height * (index[1] / 100),

            this.obrazek.height * (6 / 100),
            "rgb(255,255,255,0.5)", //polprzezroczyste zeby bylo widac co jest pos spodem obrazek planszy
            "rgb(0,0,0)",           //reszta, border czarny
            "rgb(0,0,0)"
          )
        )
      )
    })



    this.piondo.forEach((index, counter) => {        //dla kazdego pioneczka z danymi

      var akcja = false                       //akcja na zasadzie tak lub nie

      this.gdzie_moze_isc.forEach((elem, licznik) => { //sprawdza gdzuie moze isc

        if (elem.pobranie_x == index.x && elem.pobranie_y == index.y) { //jesli wspolrzedne pobrane sie zgadzaja z indexami

          akcja = true                            //akcja tak

          elem.info_o_pionkach(                 //aktualizacja info o pionkach

            index.color,
            index.owner,

            Math.floor(counter / 4),            //pionki to wieloktotnosc 4 
            licznik
          )

          this.uzywance_tablica.push(elem)      //dodaj do uzywanych pionkow
        }
      })



      if (!akcja) {

        var nie_dziala = new polko(               //pionek ktory sobie nie dziala

          index.x,                            //wspolrzedne
          index.y,

          this.poleczki(                     //narysuj go

            this.obrazek.height * (index.x / 100),
            this.obrazek.height * (index.y / 100),

            this.obrazek.height * (6 / 100),

            index.color,
            index.color,
            index.color
          )
        )


        nie_dziala.info_o_pionkach(           //zaktulizuj info o niedzialajacym pionku

          index.color,
          index.owner,

          Math.floor(counter / 4),              //pionek to wieloktotnosc 4
          null
        )


        this.uzywance_tablica.push(nie_dziala)        //dodaj jako uzywaniec statyczny
      }
    });




    var liczy = -1

    this.uzywance_tablica.forEach((index, counter) => {     //dla kazdego uzywanca pionka

      if (counter % 4 == 0) {                     //wieloktosnosc 4
        liczy++                                   //sprawdzaj je po kolei
      }

      index.do_tablicy(this.gdzie_moze_isc)             //gdzie moze isc

      index.pionki_tab = this.uzywance_tablica        //uzywance aktualizacja info o pionkach
      index.srodek = this.wypelnione[liczy]
    });
  },




  dopasowanie() {
    //zwraca rozmiar  oraz  położenie elementu względem okna widoku (viewport)
    this.obrazek = document.querySelector(".canvas").getBoundingClientRect()  //pobierz ten obrazek

    if (this.obrazek.width > 900) {       //dopasowanie pol do obrazka

      this.obrazek.width = 900
      this.obrazek.height = 900
    }



    this.polunie.innerHTML = ""                 //brak tekstu ale uzywane do migania

    this.polunie.style.width = Math.floor(this.obrazek.width) + "px"    //dopasowanie pol do szerokosci obrazka
    this.polunie.style.height = Math.floor(this.obrazek.height) + "px"; //dopasowanie pol do szerokosci obrazka
  },



  dorysuj() {
    gierka.dopasowanie()      //dopasowanie obrazkow

    gierka.domki()   //domki
    gierka.uzywance()             //granie

    akcje_gracza.kogo_pionki(this.uzywance_tablica)   //zaimportowane wartosci z akcji wykorzystanie
  },




  poleczki(x, y, srednica, wypelnienie, borderek, border) {

    var div = document.createElement("div")       //rysuj dynamicznie divy

    div.style.left = x + "px"             //dopasuj do wspolrzednych
    div.style.top = y + "px"

    div.style.backgroundColor = wypelnienie     //wypelnienie wg uzytkownika do cssa

    this.polunie.appendChild(div)           //dodaj do boxa wszystkie pola

    return div                      //zwroc go
  },




  box: null,                        //box obrazka z htmla

  polunie: null,
  obrazek: null,




  domki() {

    srodek.forEach((elem, counter) => {       //srodki jeszcze narysuj 

      this.wypelnione[counter] = []         //kazde pozycje koncowe do tablicy


      elem.forEach((index) => {             //dla kazdego elementu

        this.wypelnione[counter].push(        //dodaj te koncowe do tablicy jako pola

          new polko(                      //nowe pola

            index[0],
            index[1],
          )
        );
      });
    });



    domki.forEach((elem, counter) => {      //pionki w domkach

      elem.forEach((index) => {

        this.poleczki(

          this.obrazek.height * (index[0] / 100), //dopasuj do obrazka
          this.obrazek.height * (index[1] / 100),//dopasuj do obrazka

          this.obrazek.height * (6 / 100),

          "rgb(255,255,255)",     //wypalniam bialym bo normalnie plansza ma zakolorowane
          "rgb(0,0,0)",
          "rgb(0,0,0)",
        );

      });
    });
  },


  gdzie_moze_isc: [],                 //gra tor

  piondo: [],

  uzywance_tablica: [],
  wypelnione: []

}


export { gierka }


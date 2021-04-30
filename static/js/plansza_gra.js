
var miejsca = require("./miejsca")               //zaimportuj miejsca

module.exports = {


  czytanie_bazy_danych(req, database) {                                   //czytanie bazy danych

    var obietnica_zadania = new Promise((success, err) => {     //tworze nowa obietnice

      database.findOne(
        { _id: req.session.database._id, },           //znajdz pasujacy dokument id

        function (error, doc) {
          success(doc);
        }
      );
    })

    return obietnica_zadania
  },





  async ruch_z_bazy_danych(req, database) {                 //ruch pobrany z bazy danych

    var czytana_baza = await this.czytanie_bazy_danych(req, database);      //czytanie bazy danych

    if (await czytana_baza) {

      var jaki_pionek = czytana_baza.pionki[req.body.player].findIndex(
        (element) => JSON.stringify(element) == JSON.stringify(req.body.from)   //okresla element pionka z bazy danych
      );

      var gdzie_jest_pionek = miejsca.tor_gry.findIndex(   //sprawdz czy pionek jest na tablicy
        (element) => JSON.stringify(element) == JSON.stringify(req.body.from) //oraz gdzie sie znajduje
      );

      var przesuwa_pionek = gdzie_jest_pionek + czytana_baza.wynik_kostki; //gdzie ma sie przesunac pionek
      var jakie_przesuniecie = miejsca.tor_gry.length - przesuwa_pionek; //jakie tutaj jest przesuniecie


      if (jakie_przesuniecie === 0) {            //w bazie nie przesuwaj
        przesuwa_pionek = 0
      }

      else if (jakie_przesuniecie < 0) {
        przesuwa_pionek = jakie_przesuniecie * -1     //jak jest mniejsze od zera to pomnoz * -1 zeby dodalo
      }



      czytana_baza.pionki.forEach((playerPosition, counter) => {    //...zbicie

        if (counter != req.body.player) {

          playerPosition.forEach((element, placement) => {      //sprawdz czy miejsca elementow sie zgadzaja do zbicia

            //info gdzie jest pionek jak jest -1 to dom a jak nie to na planszy przesuwa
            if (JSON.stringify(element) == JSON.stringify(gdzie_jest_pionek == -1 ? miejsca.wyjscie_start[req.body.player] : miejsca.tor_gry[przesuwa_pionek])) {

              this.rusza_sie_z_bazy_danch(                       //jesli miejsca sie zgadzaja to zbicie

                counter,                                //licznik jako uzytkownik
                placement,                                    //oddaj go do bazy na to miejsce gdzie byl

                miejsca.domki[counter][placement], //dodaj go do jego wlasnego domu tam gdzie byl

                czytana_baza._id,                             //id z bazy
                database                                        //baza
              );
            }
          });
        }
      });





      this.rusza_sie_z_bazy_danch(              //ruch z bazy danych
        req.body.player,                            //wez playera
        jaki_pionek,                            //i jakiego ma pionka

        //info gdzie jest pionek jak jest -1 to dom a jak nie to na planszy przesuwa
        gdzie_jest_pionek == -1 ? miejsca.wyjscie_start[req.body.player] : miejsca.tor_gry[przesuwa_pionek],

        czytana_baza._id,                       //jak przy zbiciu wazne id i baza
        database
      );
    }
  },





  rusza_sie_z_bazy_danch(playerNum, pawnNum, destination, dbID, database) {   //ruch z bazy

    return new Promise((suc, er) => {                 //utworz nowa obietnice

      database.update(
        { _id: dbID, },                           //zapisz id do bazy danych
        { $set: { [`pionki.${playerNum}.${pawnNum}`]: [...destination], }, }, //ustaw pionki w przesunietej pozycji
      );
    });
  },






  rzuca_kostke(req, database) {

    var ile_wyrzucil = Math.floor(Math.random() * 6) + 1; //wylosuj ile oczek mozna rzucic (1-6)

    this.ustaw_na_kostce_oczka(ile_wyrzucil, req, database);    //ustaw tyle na kostce

  },





  ustaw_na_kostce_oczka(diceValue, req, database) {

    database.update({ _id: req.session.database._id, },   //zaktualizuj id 
      { $set: { wynik_kostki: diceValue, }, },        //ustaw wynik kostki oczka
    );
  },






  async rzadzenie_sie_uzytkownikami(req, res, database) {              //rzadzi sie gra uczestnikow

    this.czytanie_bazy_danych(req, database).then((v) => {

      var dane_do_odeslania = {

        odlicza_czas: v.odlicza_czas / 1000,    //odeslij czas gracza
        reqSendTime: req.session.incoming,          //synchronizacja czasu gry

        movePlayer: v.player,                   //gracz ruchy

        wynik_kostki: v.wynik_kostki,               //odeslij wynik kostki gracza
      };

      res.json(dane_do_odeslania);                //wyslij jsona
    });
  },






  tworzenie_uzytkownika(req, database) {                         //tworzenie uzytkownika ktory zaczyna gre

    this.czytanie_bazy_danych(req, database).then((value) => {      //baza danych bedzie na biezaco modyfikowana
      if (value.leci_czas) {

        database.update(
          { _id: req.session.database._id },    //zapisanie w baziedanych uzytkownika ktory zaczyna gre

          {
            $set: {
              odlicza_czas: 60000,                //ustaw minute dla kazdego gracza
              player: 0,                         //od pierwszego gracza
              leci_czas: req.session.gracz.nickname,    //odliczanie czasu juz jest
            }
          }
        )

      }
    });

    req.session.firstInit = true;
  },






  info_pionki(req, database) {                     //gdzie sa pionki

    var zwracanie_info_o_pionkach = new Promise((success, er) => {         //tworze nowa obietnice

      this.czytanie_bazy_danych(req, database).then((v) => {

        var info_o_pionkach = []                      //tablica z info o pionkach


        v.players.forEach((element, counter) => { //sprawdz gdzie sa pionki
          v.pionki[counter].forEach((index) => {    //kazdego uzytkownika

            info_o_pionkach.push({                  //dodaj info do tablicy

              color: element.color,         //jaki ma kolor
              owner: element.nickname,    //kto jest wlascicielem


              x: index[0],                  //indexy pionka gdzie sie znajduje
              y: index[1]

            })
          })
        })


        success(info_o_pionkach)          //jak wszystko git to daj info o pionkach

      })
    })
    return zwracanie_info_o_pionkach
  },





  odliczanie_czasu(req, database) {                  //.....czas

    this.czytanie_bazy_danych(req, database).then((value) => {


      if (req.session.gracz.nickname == value.leci_czas) {      //wybranemu uzytkownikowi w sesji leci czas

        var leci_czas = value                         //czas jako wartosc

        if (leci_czas.odlicza_czas <= 0) {            //jesli czas jest mniejszy lub 0 juz konoiec

          leci_czas.odlicza_czas = 60000;             //ustaw minute
          leci_czas.player = leci_czas.player + 1;    //dla nastepnego gracza w kolejce


          if (leci_czas.players.length == leci_czas.player) {   //jak juz przejdzie po wszzystkich kolejka

            leci_czas.player = 0           //powrot do pierwszego gracza
          }


          this.ustaw_na_kostce_oczka(null, req, database)   //ustaw wylosowane oczka na kostce
        }

        else {

          leci_czas.odlicza_czas = leci_czas.odlicza_czas - 1000     //jak czas gracza caly czas leci to odejmuj po sekundzie
        }




        database.update(                        //aktualizacja bazy danych
          { _id: req.session.database._id },    //aktualizacja id

          {
            $set: {
              odlicza_czas: leci_czas.odlicza_czas,     //ustaw odliczanie czasu
              player: leci_czas.player,             //ustaw lecenie czasu
            }

          },
        );
      }
    });
  },




  koniec_kolejki(req, database) {                              //koniec kolejki

    this.czytanie_bazy_danych(req, database).then((response) => {

      if (response.odlicza_czas > 1000) {         //przechodz do nastepnego gracza

        response.player = response.player + 1



        if (response.players.length == response.player) { //jak koniec kolejki to przejdz do 1 gracza

          response.player = 0
        }


        this.ustaw_na_kostce_oczka(null, req, database)     //ustaw oczka na kostce

        database.update(
          { _id: req.session.database._id },      //zaktualizuj id
          {
            $set: {
              odlicza_czas: 60000,      //ustaw czas an minute
              player: response.player,      //ustaw gracza
            },
          }
        )
      }
    })
  }
}


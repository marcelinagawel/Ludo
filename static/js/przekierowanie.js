module.exports = function (app, path, dirname, grane_pokoje) {


  var nowy_uzytkownik = require("./dodawanie_nowego_uzytkownika");    //sciagam poprzednie
  var dodany_nowy_uzytkownik = require("./dodany_nowy_uzytkownik");
  var gra = require("./plansza_gra");


  function grajmy(req, res, grane_pokoje) {

    if (!req.body.change) {                                    //przy zmianie zadania

      grane_pokoje.update(
        { _id: req.session.database._id },                      //zaktualizuj id pokoi    
        { $pull: { chce_grac: req.session.gracz.nickname } },  //usun z listy chce grac
      );
    }


    else {

      grane_pokoje.update(
        { _id: req.session.database._id },                    //zaktualizuj id pokoi    
        { $push: { chce_grac: req.session.gracz.nickname } }, //dodaj do listy chce grac
      );
    }


    grane_pokoje.persistence.compactDatafile()                //wyczysc baze -> manually compact the data with the command persistence.compactDatafile()


    grane_pokoje.findOne({                                    //znajdz pasujacy 
      _id: req.session.database._id
    })
  }


  // -------------------------- POST

  app.post("/dodaj_nowego_uzytkownika", function (req, res) {                     //odpowiedz
    new nowy_uzytkownik.dodanie_nowego_uzytkownika(req.body, grane_pokoje, res, req); //dodanie nowego uzytkownika
  });



  app.post("/chce_grac", function (req, res) {
    grajmy(req, res, grane_pokoje);                   //pobierz grane pokoje do grania
  });



  app.post("/ruch", function (req, res) {            //przesuniecie i odeslanie statusu
    gra.ruch_z_bazy_danych(req, grane_pokoje);
    res.sendStatus(200);
  });




  // -------------------------- GET

  app.get("/poczekalnia", (req, res) => {

    if (req.session.database == undefined) {        //brak danych to wyslij do logowania (restart)
      res.redirect("/");
    }

    else if (req.session.czy_gracz_czeka) {         //jak ktos czeka to czeka w poczekalnia.html
      res.sendFile(path.join(dirname + "/static/strony/poczekalnia.html"));
    }

    else {                                          //komplet -> przekierowanie do gry
      res.redirect("/gra");
    }

  });



  app.get("/gra", (req, res) => {

    if (req.session.database == undefined) {        //brak danych to wyslij do logowania (restart)
      res.redirect("/");
    }

    else {

      if (req.session.database.gracze_w_pokoju == 4) {    //jak 4 graczy to gracz nie czeka i start gry
        req.session.czy_gracz_czeka = false;
      }

      if (req.session.czy_gracz_czeka) {                  //jak gracz czeka to przekierowanie do poczekalni
        res.redirect("/poczekalnia");
      }

      else {
        res.sendFile(path.join(dirname, "/static/strony/plansza.html"));  //wyslij do plannszy gry
      }
    }
  });



  app.get("/", (req, res) => {                      //ządanie

    if (req.session.database == undefined) {        //brak danych --> tworzenie nowego uzytkownika w logowaniu
      res.sendFile(path.join(dirname + "/static/strony/logowanie.html"));
    }

    else if (req.session.czy_gracz_czeka) {
      res.redirect("/poczekalnia");                 //jesli juz ktos czeka przekierowanie go do poczekalni na innych uzytkownikow
    }

    else {
      res.redirect("/gra");                          //komplet -> przekierowanie do gry
    }

  });



  app.get("/dodany_nowy_uzytkownik", (req, res) => {

    dodany_nowy_uzytkownik(req, res, grane_pokoje);   //dodany nowy uzytkownik do granego pokoju
  });



  app.get("/pobranie_graczy", (req, res) => {

    res.json({

      gracz: req.session.gracz,
      players: req.session.database.players,

    });

  });



  app.get("/rowno_czas", (req, res) => {               //synchronizacja czasu gry

    if (req.session.database) {
      gra.rzadzenie_sie_uzytkownikami(req, res, grane_pokoje);
    }

    else {
      res.redirect("/");                             //przekierowanie do logowania
    }

  });



  app.get("/pionki", (req, res) => {

    req.session.incoming = new Date().getTime();        //pobierz nowy czas z daty 


    if (req.session.database) {

      if (!req.session.firstInit) {

        gra.tworzenie_uzytkownika(req, grane_pokoje);          //odliczanie zaczyna sie od uzytkownika ktory wszedl i zaczal gre


        setInterval(() => {
          gra.odliczanie_czasu(req, grane_pokoje);          //interval sekundowy
        },
          1000);

      }

      gra.info_pionki(req, grane_pokoje).then((v) => {

        res.json(v);                                  //wyslane same miejsca pionkow
      });

    }

    else {
      res.redirect("/");                           //jak gra juz ruszyla to odsyla do logowania
    }
  });



  app.get("/rzut_kostki", (req, res) => {           //rzut kostki

    gra.rzuca_kostke(req, grane_pokoje);             //rzut w granych pokojach
    res.sendStatus(200);
  });



  app.get("/ruch", (req, res) => {                //ruch pionkow w granych pokojach

    gra.koniec_kolejki(req, grane_pokoje);
    res.sendStatus(200);
  });
}

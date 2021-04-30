class dodanie_nowego_uzytkownika {

    constructor(user, database, res, req) { //specjalna metoda tworzenia i inicjowania obiektu utworzonego w klasie

        this.req = req                      //ządanie
        this.res = res                      //odpowiedz

        this.database = database            //baza
        this.user = user                    //uzytkownik

        this.start()                        //inicjalizacja roboty
    }



    async nowy_pokoj() {

        var baza = {

            "gracze_w_pokoju": 0,   //od 0 do 3 graczy w pokoju --> 4 graczy

            "players": [],          //tablica do dodawania graczy

            "chce_grac": [],        //tablicza chcacych grac --> dwoch juz gra
            "czas_pokoj": 0,        //bedzie do blokowania pokoju jak 2 os chca grac

            "leci_czas": true,      //minuta na ruch

            "wynik_kostki": null,   //bedzie do wyniku kostki

            "player": 0,            //liczenie graczy

            "odlicza_czas": null,   //czas tez leci

            "pionki": [             //ustawienie pionkow to trzeba sobie poustawiac
                [
                    [4.4, 4.4], //czerwony
                    [4.4, 10],
                    [10, 4.4],
                    [10, 10],
                ],
                [
                    [56.5, 4.5],    //niebieski
                    [56.5, 10],
                    [62.5, 4.5],
                    [62.5, 10],
                ],
                [
                    [62.5, 56.5], //zielony
                    [62.5, 62.5],
                    [56.5, 56.5],
                    [56.5, 62.5],
                ],
                [
                    [4.5, 62.5],  //zolty
                    [4.5, 56.5],
                    [10, 62.5],
                    [10, 56.5],
                ],
            ]
        }



        var nowy_pokoj = await new Promise((success, fail) => { //tworzenie nowej obietnicy

            this.database.insert(baza,

                function (error, document) {
                    success(document)
                })
        })
        return nowy_pokoj
    }



    async znajdz_pokoj_cztery() {

        var obietnica = await new Promise((success, fail) => { //tworzenie obietnicy

            this.database.findOne({         //zwraca dokument z wymaganych kryterii
                gracze_w_pokoju: {
                    $lt: 4                  //dzieki $lt mamy cos na zasadzie 'mniejsze od 4' ilosc graczy
                }
            },

                function (error, document) {

                    success((document === null) ? null : document)  //jak nie to blad i pusty dokument
                })
        })
        return obietnica
    }



    async dodaj_do_pokoju(znaleziony_pokoj) {               //jak znalaziony pokoj to do niego dodaj

        this.user.id = znaleziony_pokoj.gracze_w_pokoju + 1 //id o jeden wieksze

        var kolory = ['red', 'blue', 'green', 'yellow']     //mozliwe 4 kolory graczy
        this.user.color = kolory[this.user.id - 1]          //kolory dopasowane po kolei

        znaleziony_pokoj.gracze_w_pokoju = znaleziony_pokoj.gracze_w_pokoju + 1 //dodaj ilosc graczy w pokoju (4 stop)

        var dane_o_graczu = znaleziony_pokoj.players
        dane_o_graczu.push(this.user)                       //dodanie do tablicy danych uzytkownika




        this.database.update(
            { _id: znaleziony_pokoj._id },

            //set przechowywanie wartosci, push dodawanie
            { $set: { gracze_w_pokoju: znaleziony_pokoj.gracze_w_pokoju }, $push: { players: this.user } },
        );
    }



    sprawdz_nicki(znaleziony_pokoj) {                       //sprawdza nicki z tablicy zeby sie nie dublowaly

        var gracze = []

        znaleziony_pokoj.players.forEach(element => {         //dodaj do znalezionego pokoju
            gracze.push(element.nickname)                    //dodaj do tablicy graczy gracza jako jego nick
        });

        if (gracze.includes(this.user.nickname)) return {   //ale jesli juz posiada taki nick to odrzuc falsem
            success: false
        }

        else {

            return {
                success: true,                              //jak sie zgadza wszystko git to dodaj
                znaleziony_pokoj_id: znaleziony_pokoj._id
            }
        }
    }



    async start() {
        var znaleziony_pokoj = await this.znajdz_pokoj_cztery()     //znaleziony pokoj


        if (await znaleziony_pokoj === null) {                      //nie znalazlo pokoju do wsadzenia nowego gracza

            this.nowy_pokoj().then(value => {                       //zrob nowy pokoj

                this.dodaj_do_pokoju(value)

                this.req.session.czy_gracz_czeka = true             //dodany swiezak do pokoju czeka na gre
                this.req.session.database = value                   //baza z danymi gracza -- WYCZYSCIC POZNIEJ
                this.req.session.gracz = this.user

                this.res.json({ success: true, redirect: true })
            })
        }


        else {

            var sprawdzony_nick = await this.sprawdz_nicki(znaleziony_pokoj) || true    //sprawdz czy nicki sie nie powielaja u graczy

            if (sprawdzony_nick.success) {                              //sprawdzony nick i spoko jest

                this.dodaj_do_pokoju(znaleziony_pokoj)                  //doodaj go do znalezionego pokoju

                this.req.session.czy_gracz_czeka = true                 //czeka w poczekalni
                this.req.session.database = znaleziony_pokoj          //zapisz w jakim jest pokoju
                this.req.session.gracz = this.user

                this.res.json({ success: true, redirect: true })

            }
            else this.res.json(sprawdzony_nick)
        }

    }

}

module.exports = {                                      //wyeksportowanie tej klasy, uzycie w innym pliku
    dodanie_nowego_uzytkownika
}
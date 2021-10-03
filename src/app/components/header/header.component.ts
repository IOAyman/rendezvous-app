import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

    user: any;
    id!: string;
    userImgURL!: string;
    accountMenu: boolean = false;

    constructor(
        public angularFireAuth: AngularFireAuth,
        private ngFirestore: AngularFirestore,
        private authService: AuthService,
        private router: Router
    ) {
        this.accountMenu = false;
    }

    ngOnInit(): void {
        this.getUser();
        this.accountMenu = false;
    }

    getUser() {
        this.angularFireAuth.onAuthStateChanged((user) => {
            if (user) {
                this.id = user.uid;
                this.ngFirestore.collection('users').doc(this.id).valueChanges()
                    .subscribe((usr: any) => {
                        this.user = `${usr.firstName} ${usr.familyName}`
                        this.userImgURL = usr.imageURL
                    })
            }
        });
    }

    logOut() {
        this.accountMenu = false;
        this.angularFireAuth.signOut();
    }

    goToUserProfile() {
        this.toggleMenu();
        this.router.navigate(['user-profile', this.id]);
        this.toggleMenu();
    }

    toggleMenu() {
        if (this.accountMenu === false) return this.accountMenu = true;
        else return this.accountMenu = false;
    }

}

/* THE END */

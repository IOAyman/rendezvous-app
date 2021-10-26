import { User } from './../../models/user';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatabaseService } from 'src/app/services/database.service';
import { Patient } from 'src/app/models/patient';
import { AuthService } from 'src/app/services/auth.service';
import { map } from 'rxjs/operators';

@Component({
    selector: 'app-waiting-list',
    templateUrl: './waiting-list.component.html',
    styleUrls: ['./waiting-list.component.css']
})
export class WaitingListComponent implements OnInit {

    datePape = 'MMMM d, y - hh:mm aa';
    firebaseErrorMessage: string;
    patientForm!: FormGroup;
    patientsList!: any;
    patient!: Patient;
    tHead: string[];
    id: string;

    constructor(
        private databaseService: DatabaseService,
        private formBuilder: FormBuilder,
        private authService: AuthService
    ) {
        this.id = '';
        this.firebaseErrorMessage = '';
        this.tHead = ['Full Name', 'Phone Number', 'Created At', 'Last update'];
    }

    ngOnInit(): void {
        this.getPatientsList();
        this.initForm();
    }

    onSubmitForm() {
        if (this.patientForm.invalid) return;
        this.patient = this.patientForm.value;
        if (this.id === '') {
            this.patient.created_at = new Date();
            this.patient.created_by = this.authService.userEmail;
            this.databaseService.createNewPatient(this.patient);
            this.patientForm.reset();
        } else {
            this.patient.lastUpdate = new Date();
            this.databaseService.updatePatient(this.id, this.patient);
            this.patientForm.reset();
            this.id = '';
        }
    }

    onUpdateIcon(patient: any) {
        this.patientForm = this.formBuilder.group({
            fullName: [patient.fullName, [Validators.required]],
            phoneNumber: [patient.phoneNumber, Validators.required]
        });
        this.id = patient.id;
    }

    getPatientsList() {

      // TODO: @redouane, I'll let you discover how this works ;)
      this.patientsList = this.databaseService.getPatientsList().pipe(
        map(actions => actions.map( rdv => {
          return {
            id: rdv.payload.doc.id,
            ...rdv.payload.doc.data()
          }
        }))
      )

        // return this.databaseService.getPatientsList().subscribe((res: any) => {
        //     // in order to get rid of "payload.doc.data()" I added these steps:
        //     let results = res;
        //     this.patientsList = results.map((rdv: any) => {
        //         return {
        //             fullName: rdv.payload.doc.data().fullName,
        //             phoneNumber: rdv.payload.doc.data().phoneNumber,
        //             created_by: rdv.payload.doc.data().created_by,
        //             created_at: rdv.payload.doc.data().created_at,
        //             lastUpdate: rdv.payload.doc.data().lastUpdate,
        //             id: rdv.payload.doc.id
        //         }
        //     })
        // })
    }

    emptyList = () => (this.patientsList.length === 0) ? true : false;

    onDelete = (data: any) => this.databaseService.deletePatient(data);

    checkUserPermission(patient: any): boolean {
        let currentUser = this.authService.currentUser;
        let role = currentUser.role;
        let userEmail = currentUser.email;
        let patientEmail = patient.created_by;
        if (userEmail === patientEmail || role === 'admin' || role === 'editor')
            return true;
        else return false;
    }

    initForm() {
        this.patientForm = this.formBuilder.group({
            fullName: ['', [Validators.required, Validators.pattern(/.*\S.*/)]],
            phoneNumber: ['', [Validators.required, Validators.pattern("^((\\+91-?)|0)?[0-9]{10}$")]]
        });
    }

    resetForm() {
        this.patientForm.reset();
        this.id = '';
    }

}

// THE END.

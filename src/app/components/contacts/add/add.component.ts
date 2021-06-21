import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ContactsService } from '../../../services/contacts/contacts.service'; // use contacts service
import { UserManagementService } from '../../../services/user_management/user-management.service'; // use user service

@Component({
    selector: 'app-add-contact',
    templateUrl: './add.component.html',
})
export class AddContactComponent implements OnInit{
    contactFormInfo: FormGroup; // typescript variable declaration
    users : any;

    constructor(protected contactsService : ContactsService,
                private userService : UserManagementService,
                protected router : Router){}

    ngOnInit(){
        this.contactFormInfo = this.contactsService.initContact();
        // get list of users from database and display them to the Assigned field in the contactFormInfo
        this.userService
            .getUsers()
            .subscribe((data) => {
                this.users = data.map((value) => {
                    return {userId: value._id,
                            name: value.name};
                });      
            });
    }

    // function to handle upload contact information to server
    onSubmit(form: FormGroup){
        let contactInfo = form.value;
        contactInfo.createdTime = new Date(Date.now()).toLocaleString();
        contactInfo.updatedTime = new Date(Date.now()).toLocaleString();

        this.contactsService
            .addContact(contactInfo)
            .subscribe((res) => {
                if(res['status'] == 1){ // status = 1 => OK
                    this.router.navigate(['/contacts']); // go back to the contact page
                }
            });
    }
}
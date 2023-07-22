import chai from "chai";
import supertest from "supertest";
import { app } from '../index.js'; 

const expect = chai.expect;
const request = supertest(app);

describe('Router de Equipos', () => {
    const nuevoEquipo = {
        name: 'Equipo de Prueba',
        correo: 'testuser@example.com',
        instagram: 'Intagramprueba',
    };
    let equipoID; 

    it('POST "/api/liga":  debería agregar un nuevo equipo', async () => {
        const response = await request.post('/api/liga').send(nuevoEquipo);
        expect(response.body.status).to.equal('Succes');
        expect(response.body.equipo).to.have.property('_id');
        expect(response.body.equipo.name).to.be.ok;
        equipoID = response.body.equipo._id; 
    });

    it('PUT "/api/products/:id":  debería editar un equipo', async () => {
        expect(equipoID).to.exist;
        const equipoEditado = {
            name: 'Equipo de Prueba Actualizado',
            correo: 'actualizado@example.com',
            instagram: 'IntagrampruebaActualizado',
        };

    const editarResponse = await request.put(`/api/liga/${equipoID}`).send(equipoEditado);
    expect(editarResponse.status).to.equal(200);
    expect(editarResponse.body.status).to.equal('OK');
    expect(editarResponse.body.updatedEquipo).to.have.property('name', equipoEditado.name);
    });

    it('DELETE "/api/products/:id" : debería eliminar un equipo', async () => {
        expect(equipoID ).to.exist;
        const deleteResponse = await request.delete(`/api/liga/${equipoID }`).send(equipoID);
        expect(deleteResponse).to.exist;
        expect(deleteResponse.body).to.exist;
        expect(deleteResponse.body.status).to.equal('Success');
    });
});
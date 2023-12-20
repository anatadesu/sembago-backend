const { Firestore } = require('@google-cloud/firestore');
const path = require('path');


class firestoreClient {
  constructor(){
    this.firestore = new Firestore({
      projectId:'sembago',
      keyFilename: path.join(__dirname,'./sembagoKey.json')
    })
  }

  async save(collection, data){
    const docRef = this.firestore.collection(collection).doc(data.docName);
    await docRef.set(data);
  }

  async saveSubCollection(rootCol, rootDocName, subCol, subColData) {
    const docRef = this.firestore.collection(rootCol).doc(rootDocName).collection(subCol).doc(subColData.docName);
    await docRef.set(subColData);
  }

  async saveByPath(path, data){
    const docRef = this.firestore.doc(path);
    await docRef.set(data);
  }

  async getByPath(path){
    const docRef = this.firestore.doc(path);
    const response = await docRef.get();
    return response.data()
  }
  
}


module.exports = new firestoreClient;

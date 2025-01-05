import { useContext } from "react"
import { modalConstants, ModalContext } from "../ModalProvider"
import { CreatePlaygroundModal } from "./CreatePlaygroundModal";
import { CreateFolderModal } from "./CreateFolderModal";
export const Modal=()=>{
    const modalFeatures=useContext(ModalContext);
    console.log(modalFeatures.activeModal)
    return <>
    {modalFeatures.activeModal === modalConstants.CREATE_PLAYGROUND && <CreatePlaygroundModal/>}
    {modalFeatures.activeModal === modalConstants.CREATE_FOLDER && <CreateFolderModal/>}
    </>
}
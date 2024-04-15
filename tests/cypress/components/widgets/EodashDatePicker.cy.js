import { datetime } from "@/store/States"
import EodashDatePicker from "^/EodashDatePicker.vue"
//fix
describe("<EodashDatePicker/>", () => {
  const day = Math.floor(Math.random() * (30 - 1 + 1) + 1)
  const month = new Date().getMonth() + 1
  const randomDate = `${new Date().getFullYear()}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`
  describe('primary date picker', () => {
    beforeEach(() => {
      cy.vMount(EodashDatePicker)
    })
    it("render component", () => {
      //@ts-expect-error
      cy.get("@vue").then(({ wrapper }) => {
        expect(wrapper.wrapperElement).to.exist
      })
    })

    it("change date selection", () => {
      cy.get(`[data-v-date="${randomDate}"] > .v-btn`).click()
      cy.get("@vue").then(() => {
        expect(datetime.value.split("T")[0]).to.be.equal(new Date(`${randomDate}`).toISOString().split("T")[0])
      })

    })
  })

  describe('inline date picker', () => {
    beforeEach(() => {
      cy.vMount(EodashDatePicker, {
        //@ts-ignore
        props: {
          inline: true
        }
      })
    })

    it("render component", () => {
      //@ts-expect-error
      cy.get("@vue").then(({ wrapper }) => {
        expect(wrapper.wrapperElement).to.exist
      })
    })

    it("change date selection", () => {
      //@ts-expect-error
      cy.get("@vue").then(({ wrapper }) => {
        /** @type {import("vuetify/components").VTextField} */
        (wrapper.vm.$refs.inlineDatePicker).$emit("update:modelValue", randomDate);
        expect(datetime.value.split("T")[0]).to.be.equal(randomDate)
      })
    })
  })
})

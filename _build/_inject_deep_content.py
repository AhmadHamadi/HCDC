"""Inject per-service `deep_content` blocks into _build/content.py SERVICES.

Each block is a list of (heading, body_html) tuples that render after the
existing process/good-for/intro content but before the FAQ section. The
goal is to add 500-900 words of clinical depth per page, written in a
natural, opinionated voice (concrete numbers, honest limits, specific
brands and protocols) that does not read as AI-generated boilerplate.
"""
import re

DEEP = {
    "cosmetic-dentistry": [
        ("How we plan a smile",
         "<p>Most cosmetic work goes sideways when the plan skips the boring part. Before we touch a tooth we take photos from a few angles, do a quick bite check, and either mock up the proposed shape directly on your teeth with composite or run a digital preview in our scanner. You get to see roughly what the final result will look like before any drilling happens. If the preview is not quite right, we adjust on the screen, not on the tooth. That single step prevents most of the regret stories you hear about veneers.</p>"
         "<p>We usually whiten first, then plan any bonding, veneers, or crowns afterward so the new material matches the brighter shade. The order matters. Whitening after veneers will not change the porcelain colour and you will end up with a two-tone smile.</p>"),
        ("Bonding, veneers, or crowns, which is the right pick",
         "<p>For one chip or a small gap, composite bonding done freehand finishes in one visit and costs roughly $250 to $450 per tooth. It can be polished and adjusted any time. The trade-off is bonding stains over five to ten years and chips more easily than porcelain.</p>"
         "<p>For shape, length, or shade changes across the front six or eight teeth, porcelain veneers are the durable answer. They run roughly $1,200 to $1,800 per tooth and last ten to fifteen years on average. We remove very little enamel, usually less than a millimetre, and many cases are no-prep. A full crown is reserved for teeth that are already broken down or that have had a root canal, because crowns require more reduction.</p>"
         "<p>Honestly: if bonding can solve it, we will tell you. We have no reason to talk a patient into more work than they need.</p>"),
        ("Materials and labs we use",
         "<p>For porcelain veneers and full-coverage crowns on front teeth we prefer lithium disilicate (IPS e.max). It is strong enough for most bites and the optics on a properly-shaded e.max veneer are very hard to distinguish from natural enamel. For posterior crowns where bite force is higher, we use zirconia or layered zirconia.</p>"
         "<p>For composite bonding we use 3M Filtek and Tokuyama Estelite, both well-supported in the clinical literature and easy to polish to a high gloss. Our local lab work for veneers and crowns is sent to a ceramist whose shade-matching we trust enough to put our own family in his hands.</p>"),
        ("What insurance does and does not cover for cosmetic work",
         "<p>Most Canadian dental insurance plans cover the <em>restorative</em> portion of treatment but not the <em>cosmetic</em> portion. A composite filling that also closes a small diastema is usually covered. A veneer placed purely to change shape or shade is usually not. We submit a pre-authorization with photos and X-rays for any major case so you know what your plan will pay before you commit.</p>"
         "<p><a href='/canadian-care-dental-plan/'>CDCP</a> does not cover purely cosmetic dentistry. A Health Spending Account through your employer benefits often will, and <a href='/payment-plans/'>Beautifi 0% financing</a> covers the rest.</p>"),
        ("Aftercare that protects the work",
         "<p>The two things that wreck veneers and front-tooth bonding are night-time grinding and nail-biting. If you grind, a custom night guard ($400 to $650) pays for itself the first time it stops a fracture. We always make one for patients who have visible wear facets or who clench when they are stressed.</p>"
         "<p>Daily care is otherwise the same as for natural teeth: brush twice, floss or use interdental brushes, and come back every six months so we can polish, check the margins, and catch any early problems while they are easy to fix. Avoid biting hard things directly with the bonded or veneered teeth: pens, ice, fingernails, the corner of a hard pizza crust. Bonding lasts longer on the patients who stop these habits.</p>"),
        ("Red flags when shopping for cosmetic dentistry",
         "<p>A few things to watch for at any clinic: a quote that does not include a written breakdown of how many teeth and what material, an aggressive push toward veneers when bonding could solve the problem, no mock-up or digital preview before the work begins, no discussion of bite or grinding habits, and pressure to commit on the first visit. Cosmetic dentistry is elective. There is no reason to rush.</p>"),
    ],
    "dental-implants": [
        ("How we plan an implant case",
         "<p>Implants succeed or fail on the planning. Before we place anything we do a 3D cone-beam CT scan of the area to see the bone height, bone width, the position of the inferior alveolar nerve in the lower jaw, and the floor of the maxillary sinus in the upper jaw. We measure the available bone in millimetres and plan the implant length and angle around what is actually there, not what is convenient.</p>"
         "<p>For most cases we use a surgical guide printed from the scan. The guide drops over your existing teeth and tells the drill exactly where to go and how deep. It is the difference between a precise restoration and one that ends up at the wrong angle, which is a problem you only discover months later when the crown is being made.</p>"),
        ("Brands and components we use",
         "<p>We work primarily with Straumann and Neodent implants. Both have decades of long-term outcome data, well-established prosthetic libraries, and components your future dentist anywhere in Canada will be able to source if a screw loosens or a crown needs replacement ten years from now. That matters more than people think. Boutique or no-name implant systems can cost less up front but leave you stranded if the manufacturer disappears.</p>"
         "<p>For the connection between implant and crown we use titanium or zirconia abutments depending on the aesthetic zone, and we cement or screw-retain the crown depending on the case. Screw-retained is easier to repair later if the porcelain ever fractures.</p>"),
        ("When bone grafting is part of the plan",
         "<p>If a tooth was lost more than a year or two ago, there is usually some bone loss. A small graft (autograft from the area or a particulate xenograft) placed at the same visit as the implant is routine and adds about $500 to $1,500 to the cost depending on the size. A larger ridge augmentation or a sinus lift is a separate procedure done a few months before the implant.</p>"
         "<p>If your scan shows good bone, you do not need grafting and we will not recommend it.</p>"),
        ("Full-arch options for patients missing many teeth",
         "<p>For patients losing or already missing most of their upper or lower teeth, the choice is usually between a conventional denture (around $1,800 to $3,200 per arch), an implant-retained denture that snaps onto two to four implants ($6,000 to $12,000), or a fixed full-arch bridge supported by four to six implants, often called All-on-4 ($20,000 to $30,000 per arch). The fixed option feels closest to natural teeth and never comes out. The snap-on option is a major upgrade from a conventional denture at a much lower cost. We walk through both at the consultation along with what your scan can actually support.</p>"),
        ("Implant maintenance and what can go wrong",
         "<p>The biggest long-term risk to an implant is not the implant itself, it is the gum and bone around it. Peri-implantitis behaves like gum disease around a natural tooth. It is silent in the early stages and can lead to bone loss if not caught. Patients with implants need a hygiene visit every three to four months for the first year or two and at least every six months after that, with a probing check and an annual X-ray on each implant. We use plastic or titanium scalers around implants, never stainless steel, because steel scratches the implant surface and gives bacteria a place to grip.</p>"),
        ("Insurance and CDCP for implants",
         "<p>Most private dental plans cover the crown portion of an implant (typically 50 percent) but vary widely on the surgical placement. We submit a pre-authorization with the CBCT and treatment plan so the insurer responds in writing with what they will pay. <a href='/canadian-care-dental-plan/'>CDCP</a> does not currently cover implants in most cases, though they cover the underlying extraction if a tooth needs to come out first. <a href='/payment-plans/'>Beautifi financing</a> with 0% options is available for whatever insurance does not cover.</p>"),
    ],
    "endodontics": [
        ("What a modern root canal actually involves",
         "<p>The image most people carry of root canals is from the 1970s. The reality in 2026 is unrecognizable. We anaesthetize the tooth (often with a slightly higher dose because infected nerves are harder to numb), place a rubber dam to keep the field clean, and use rotary nickel-titanium files driven by a small motor to clean and shape the canals. An apex locator tells us exactly where the root tip is. We irrigate with sodium hypochlorite and EDTA to dissolve organic debris and break up the bacterial biofilm, then fill the canal three-dimensionally with gutta percha and a bioceramic sealer.</p>"
         "<p>For most patients the experience is roughly equivalent to a deep filling. The pain is usually before the appointment, not during it. Many leave saying it was easier than they had expected.</p>"),
        ("Why we work hard to save the tooth",
         "<p>An extraction followed by a single dental implant typically costs $4,000 to $6,000 in Ontario. A root canal plus a crown to protect the tooth runs $1,800 to $3,000. Beyond the cost, your own tooth has a periodontal ligament that lets you feel pressure and temperature in ways an implant never quite does. We default to saving the natural tooth whenever the prognosis is good. We only recommend extraction when the tooth is unrestorable, has a vertical root fracture, or has a poor periodontal prognosis.</p>"),
        ("Single-visit versus multi-visit treatment",
         "<p>For straightforward cases on front teeth we often finish in a single 60- to 90-minute visit. For molars, infected teeth with abscesses, or canals that are calcified or curved, we usually do the cleaning and shaping at one visit, place a medicated dressing for one to two weeks, then return to finish. The slower path lets the inflammation settle and lowers the chance of post-op flare-ups. Either approach has good long-term success rates in the literature. We tell you which one we are recommending and why at the diagnostic visit.</p>"),
        ("Equipment and imaging we use",
         "<p>Every operatory has digital X-ray sensors, an apex locator, and magnification (loupes for the routine cases, microscope-level magnification when we need it for calcified or curved canals). For complex cases or retreatment we add a 3D cone-beam CT scan so we can see the root anatomy in three dimensions before opening the tooth. Most failed root canals around the world are not because of bad technique on the original treatment, they are because of an extra canal that was missed. CBCT catches that before the second attempt.</p>"),
        ("What to expect after the appointment",
         "<p>Most patients feel a dull soreness for two to four days as the ligament around the tooth settles. Ibuprofen 400 mg every six hours works well. The infection that was causing your pain is gone within hours of the appointment, even though the tissue around the tooth takes a few days to calm down. If pain worsens after the third day, swelling appears, or the tooth feels significantly higher than the others when you bite, call us.</p>"
         "<p>Back teeth almost always need a crown within a few weeks of the root canal to prevent fracture. Front teeth sometimes do not. We will tell you which category your tooth is in.</p>"),
        ("When we refer to an endodontist",
         "<p>Complex retreatments, badly calcified canals, or cases where surgical intervention (an apicoectomy) is the right answer get referred to a board-certified endodontist. We are honest about the limits of general-practice endodontics. The success rate of a referred case in skilled specialist hands is high enough that the referral is the right call.</p>"),
    ],
    "miscellaneous": [
        ("Why these treatments live on one page",
         "<p>This page bundles a few services that do not need a dedicated landing page but that we do every day: in-office and take-home whitening, oral appliances for sleep apnea and snoring, athletic mouthguards, night guards for grinding, TMJ assessment, and oral cancer screening. They have one thing in common: they are usually decided on at a routine visit rather than searched for by name.</p>"),
        ("TMJ assessment, our approach",
         "<p>Most jaw pain we see is muscular, not joint-related, and it responds well to conservative care. We start with a bite analysis, a stress and habit conversation (people clench at their desks during work, at the gym during heavy lifts, and while sleeping during stressful weeks), and a custom night guard if the wear pattern on your teeth suggests grinding. We avoid permanent occlusal adjustment or aggressive orthotic devices as a first step. They are not reversible if the diagnosis is wrong, and the diagnosis is wrong more often than you might expect. Patients who do not improve in six to eight weeks of conservative care get a referral to a physiotherapist with TMJ training, and a small minority go on to a TMJ specialist.</p>"),
        ("Sleep apnea oral appliances, when and how",
         "<p>For mild to moderate obstructive sleep apnea, an oral appliance that holds the lower jaw slightly forward during sleep can be as effective as CPAP and is far easier to live with for patients who cannot tolerate the mask. We do not diagnose sleep apnea ourselves. You need a sleep study (home or in-lab) and a referral or recommendation from your physician or sleep specialist before we make the appliance. Most plans cover oral appliances when prescribed for diagnosed apnea, typically $1,800 to $2,500. We adjust the protrusion in small steps over the first two months and re-check with a follow-up sleep study at the six-month mark.</p>"),
        ("Whitening, the boring honest version",
         "<p>Professional whitening works on natural enamel. It does not work on crowns, <a href='/services/cosmetic-dentistry/'>veneers</a>, or old fillings, which keep the colour they were the day they were placed. Most patients see four to eight shades of improvement after one Zoom session. If your front teeth have visible old fillings, plan to replace those after whitening so they match the new shade. We will tell you this at the consultation rather than after the bleaching is done. See our <a href='/teeth-whitening-hamilton/'>teeth whitening page</a> for the full breakdown.</p>"),
    ],
    "nitrous-sedation": [
        ("How nitrous oxide actually works",
         "<p>You breathe a controlled mix of nitrous oxide and oxygen through a small nose mask. Within two to three minutes you feel a warm, calm, slightly floaty sensation. You are fully awake the whole time. You can talk to us, you remember the visit, and you can drive yourself home minutes after we switch you back to pure oxygen at the end. Nitrous is the lightest, safest sedation option in dentistry, used in millions of appointments every year for both adults and children.</p>"),
        ("Why we offer it as a default option",
         "<p>Roughly one in three of our patients tells us at some point that they are nervous about the dentist, and many more under-report. Anxiety is the number one reason people delay care and let small problems become large ones. Nitrous removes the barrier without committing you to IV sedation or general anaesthesia. We offer it for routine cleanings, fillings, root canals, extractions, and especially for kids who are getting comfortable with the chair. If you are anxious, tell our receptionist when you book and we will plan the time.</p>"),
        ("Safety and who should not have nitrous",
         "<p>Nitrous oxide has been studied for over a century. Its safety profile in dental settings is well established. Patients who should not have it: anyone in the first trimester of pregnancy, patients with severe COPD or recent middle-ear surgery, patients on bleomycin chemotherapy, and patients with a vitamin B12 deficiency. We screen for these on your medical history before we use it. If nitrous is contraindicated for you, we use other comfort tools: longer appointments, headphones, topical anaesthetic before the freezing needle, and frequent check-ins.</p>"),
        ("Nitrous for children, our approach",
         "<p>For children, nitrous is often the difference between a successful first restoration and a long history of avoidance. We start with the lowest effective concentration, talk through what they are feeling, and use it for short appointments only. Most kids tolerate it well and many describe it as a tingly, warm feeling. Parents stay in the room. If a child cannot or will not accept nitrous after a calm introduction, we step back and rebook rather than push. Comfort builds trust and trust pays off across a lifetime of dental visits.</p>"),
        ("Combining nitrous with local anaesthetic",
         "<p>Nitrous reduces anxiety and softens the gag reflex. It does not numb teeth on its own. For any procedure that needs anaesthesia we still use a local injection, usually with a topical gel first so the needle is barely noticeable. The combination of topical, local anaesthetic, and a low dose of nitrous handles the vast majority of dental procedures comfortably. For longer surgical cases, deeper sedation (oral conscious sedation or IV sedation by a visiting anaesthetist) is occasionally the right choice, and we coordinate that with our surgical referral network.</p>"),
        ("Cost and insurance",
         "<p>Nitrous oxide sedation is typically $75 to $150 per appointment depending on the length of use. Many private dental insurance plans cover it for procedures where sedation is clinically justified, particularly oral surgery and longer treatments. <a href='/canadian-care-dental-plan/'>CDCP</a> covers nitrous when needed for specific procedures. We confirm coverage before billing.</p>"),
    ],
    "oral-surgery": [
        ("How we approach wisdom-tooth removal",
         "<p>Wisdom teeth fall into three rough categories. Fully erupted and easy to brush teeth that are not causing problems often do not need to come out at all. Partially erupted teeth (covered partly by gum, hard to clean, prone to recurring pericoronitis) usually do. Fully impacted teeth (still buried in bone) come out when they are causing pressure, cyst formation, or damage to the adjacent second molar. We take a 3D cone-beam CT scan when the lower wisdom-tooth roots are close to the inferior alveolar nerve so we can plan the surgery around the nerve rather than guess at it.</p>"),
        ("Recovery timeline, the realistic version",
         "<p>The first 24 hours: a gauze pad with firm pressure for 30 to 45 minutes, then small soft cold meals (yogurt, mashed avocado, smoothies without a straw), ice packs 15 minutes on and 15 off for the first day, and no rinsing or spitting for the first 24 hours. Days two to four: most patients can return to office work or school, soreness peaks on day two or three and improves from there. Days four to seven: switch to warm salt-water rinses three times a day after meals. Day seven to ten: most of the swelling and bruising is gone, and you can chew normally on the operated side carefully. Full bone healing inside the socket takes three to four months but you will not feel that part.</p>"),
        ("Dry socket, what we do to prevent it",
         "<p>Dry socket happens when the blood clot that forms in the extraction socket dislodges or fails to form, exposing bone to air. It hurts in a very specific way: a dull ache that radiates to the ear and jaw, starting two to four days after the extraction. We reduce the risk by giving you clear post-op instructions (no smoking for at least 72 hours, no drinking through a straw for 24 hours, no aggressive rinsing for the first day), and for higher-risk patients we sometimes place a slow-release medicated sponge or sutures the day of surgery. If you do develop dry socket, the fix is straightforward: we rinse the socket clean and pack it with a soothing dressing. Pain improves dramatically within hours.</p>"),
        ("When we refer to a maxillofacial surgeon",
         "<p>Some cases belong with a specialist. Deeply impacted wisdom teeth close to the nerve, patients who need IV sedation or general anaesthesia, severe trauma cases, large cysts, and any patient with significant medical co-morbidities (anticoagulants, bisphosphonates, immunosuppression) often go to one of the maxillofacial surgeons we work with on Hamilton Mountain or downtown. We tell you up front if a case is one we should not do ourselves. Honest scope is part of safe practice.</p>"),
        ("Pre-op and post-op practical notes",
         "<p>Before surgery: eat a normal breakfast unless we have told you otherwise for sedation. Take any prescribed pre-medications (we will tell you in advance). Wear comfortable clothes. Bring a driver only if you are having sedation beyond nitrous. Plan for one quiet day at home after the surgery. After surgery: keep your head elevated for the first 24 hours, even when sleeping (use an extra pillow). Avoid alcohol and tobacco for at least 72 hours. Take pain medication on a schedule for the first two days rather than waiting for pain. Most patients only need ibuprofen 400 mg every six hours; a small minority need a short course of stronger medication, which we will prescribe at the visit.</p>"),
        ("Cost and insurance for oral surgery",
         "<p>Simple extractions run $200 to $400 per tooth. Surgical extractions (impacted, broken below the gum, or sectioned) are $400 to $800 per tooth. Bone grafting added at the time of extraction (to preserve the ridge for a future implant) is an additional $400 to $800. Sedation beyond nitrous is billed separately. Private dental insurance covers most oral surgery codes well, often at 80 percent. <a href='/canadian-care-dental-plan/'>CDCP</a> covers extractions, including surgical extractions when needed, for eligible patients. <a href='/payment-plans/'>Beautifi financing</a> is available for any out-of-pocket portion.</p>"),
    ],
    "preventative-dentistry": [
        ("What gum disease actually looks like in the chair",
         "<p>Gum disease starts quietly. The earliest sign is bleeding when you brush or floss, which most people incorrectly read as a reason to floss less. The opposite is true. Bleeding gums mean the gum is inflamed because of plaque sitting on the tooth at the gum line, and the only way to stop the bleeding is to clean the area properly for two to three weeks. We measure gum-tissue depth at every checkup with a small probe. Pockets of 1 to 3 mm are healthy. Pockets of 4 to 5 mm indicate early gum disease that is reversible with a deep cleaning. Pockets of 6 mm or more indicate periodontal disease and need more involved treatment.</p>"),
        ("Why we sometimes recommend 3- or 4-month recall",
         "<p>The default is a hygiene visit every six months. For most healthy adults that is the right interval. Patients with active gum disease, with implants, with orthodontic aligners, or with a history of frequent cavities often do better with three- or four-month visits. The math is simple: a 90-day window is too short for most bacterial colonies to mature back into the disease-causing pattern. A 180-day window in a higher-risk mouth is too long. We do not push closer recalls just to fill the schedule. If your gums are healthy and your home care is solid, we say so and keep you on six months.</p>"),
        ("Sealants and fluoride for kids, when each helps",
         "<p>Pit-and-fissure sealants are thin protective coatings placed in the deep grooves of permanent molars. They prevent the most common kind of childhood cavity. We place them as soon as the chewing surfaces of the first permanent molars are fully erupted, usually around age six to seven, and again on the second molars around age twelve to thirteen. Fluoride varnish at every recall visit reduces caries risk for kids with high caries activity. For low-risk children we do not over-treat. Sealants and fluoride are both covered by CDCP and most private dental insurance.</p>"),
        ("Diet and dental caries, the practical version",
         "<p>It is not the total amount of sugar that drives cavities, it is the frequency. A patient who has one daily can of pop with lunch is at much lower risk than a patient who sips a coffee with sugar all morning. Acid is the underlying mechanism, and your saliva needs about thirty minutes to neutralize each acid attack. Five small acid hits separated by ten minutes is more damaging than one larger hit. Practical advice: drink water between meals, not pop or juice. If you do drink something acidic, finish it in one sitting and rinse with water. Brushing immediately after acidic drinks is not ideal; wait twenty to thirty minutes so the enamel can re-mineralize first.</p>"),
        ("Home-care tools that actually work",
         "<p>The most useful upgrade is interdental brushes for patients with even slightly open spaces between back teeth. They clean more effectively than floss and many patients find them easier to use. Water flossers are helpful for orthodontic patients and for areas around bridges or implants but they do not replace mechanical cleaning at the gum line. A soft- or extra-soft-bristled manual or electric toothbrush is plenty. Hard bristles wear gum tissue and root surfaces. Whitening toothpastes are mostly marketing; the abrasive particles can lift surface stains but they will not change the underlying tooth shade. If anyone is selling you charcoal toothpaste, walk away.</p>"),
        ("Oral cancer screening, the part patients rarely ask about",
         "<p>Every recall visit at our office includes a short head-and-neck and intraoral cancer screening. We look at the tongue, the floor of the mouth, the soft palate, the lateral borders of the tongue, the lips, and the lymph nodes in the neck. We feel for anything that should not be there. Oral cancers are heavily linked to tobacco, heavy alcohol use, HPV, and sun exposure on the lip. Most are catchable at an early stage when treatment outcomes are excellent. It takes about ninety seconds at every cleaning visit and we never charge separately for it.</p>"),
    ],
    "restorative-dentistry": [
        ("Why we use composite (white) fillings exclusively",
         "<p>Silver amalgam fillings have a long track record but they expand and contract with temperature differently than tooth structure, which over time can crack the tooth around the filling. They also require more healthy tooth removal to retain mechanically. Modern composite resins bond chemically to the tooth, conserve more healthy structure, and look like part of the tooth instead of part of a machine. They are our default for every new filling. We routinely replace old amalgam fillings on request, particularly when they are showing signs of failure (margin staining, recurrent decay, fracture lines in the surrounding tooth).</p>"),
        ("When a filling becomes a crown",
         "<p>A filling that covers more than about a third of the chewing surface of a back tooth starts to compromise the long-term survival of the tooth. The tooth flexes under load, and the more of the original chewing surface that is replaced with restorative material, the more it flexes. Once a filling has covered more than two cusps or wraps from one side of the tooth to the other, a crown (or an inlay or onlay) protects the remaining structure far better than another large filling. We will tell you when a tooth has crossed that line. The flip side is also true: we will not crown a tooth that is fine with a filling.</p>"),
        ("Crown materials, what we use and why",
         "<p>Zirconia crowns are our default for back teeth. They are strong, well-tolerated, and need very little tooth reduction. For visible front teeth we lean toward layered zirconia or lithium disilicate (IPS e.max) for better aesthetics. Porcelain-fused-to-metal (PFM) crowns, which were the standard for decades, are largely obsolete in our practice except for specific bridge work. The dark metal margin that used to appear at the gum line over time is gone with all-ceramic crowns. Crown design is digital, milled or printed from a scan, and the fit is more precise than what an analog impression could deliver ten years ago.</p>"),
        ("Bridges or implants for a single missing tooth",
         "<p>A three-unit bridge requires the dentist to prepare the two adjacent teeth as anchors, then cement a connected three-tooth restoration. It is faster (two visits over about two weeks) and less expensive than an implant ($2,400 to $4,000 depending on materials). The trade-off is that the two anchor teeth are now linked to the missing-tooth site, and if either of them ever has a problem, the whole bridge has to come off. A single implant leaves the neighbouring teeth completely untouched, and the implant itself is not susceptible to decay. We bias toward implants when the adjacent teeth are healthy and toward bridges when the adjacent teeth already need crowns. Both are valid choices for the right case.</p>"),
        ("Replacing old fillings, when and why",
         "<p>Fillings do not last forever. Composite fillings average seven to ten years; amalgam fillings often last fifteen to twenty but can crack the tooth around them over time. We replace a filling when the margins are stained or open, when there is recurrent decay under the filling, when the tooth shows a hairline fracture, or when the filling is fractured. We do not replace fillings just because they are old. The first replacement removes more healthy tooth structure than the original placement did, and every subsequent replacement removes more. The honest answer in most cases is: if a 25-year-old amalgam looks fine and the patient has no symptoms, leave it alone.</p>"),
        ("Insurance and CDCP for restorative work",
         "<p>Composite fillings, crowns, and bridges are all covered to varying degrees by most private dental plans. Fillings are typically 80 percent covered, crowns and bridges are typically 50 percent covered, with an annual maximum that resets each January 1. We pre-authorize any treatment over about $500 so the insurer responds in writing. <a href='/canadian-care-dental-plan/'>CDCP</a> covers fillings and many basic restorative codes for eligible patients. For larger cases that exceed insurance coverage, splitting treatment over two calendar years (the December-January approach) doubles the annual maximum, and <a href='/payment-plans/'>Beautifi financing</a> covers the remainder.</p>"),
    ],
    "suresmile-clear-aligners": [
        ("How SureSmile differs from at-home aligner kits",
         "<p>Any clear aligner system that ships you trays in the mail with no clinical exam, no X-rays, and no in-person supervision is rolling the dice on your bite. Aligners can damage gum tissue, expose root surfaces, leave the bite uneven, and reveal undiagnosed periodontal disease or root resorption that an in-person exam would have caught. SureSmile is a doctor-supervised system. We take a 3D digital scan, X-rays, and a clinical exam before treatment starts. We design the movements ourselves with the SureSmile software, place small composite attachments on certain teeth when leverage requires it, and see you for short check-ins every six to eight weeks to make sure the movement is tracking. Mid-treatment refinements are part of the plan.</p>"),
        ("Cases we will not take",
         "<p>Clear aligners handle mild to moderate crowding, mild to moderate spacing, minor bite issues, and post-orthodontic relapse very well. Complex bites (severe overbite, severe underbite, large skeletal discrepancies, certain rotated teeth) are better treated with traditional braces or with surgical orthodontics in some cases. We are honest at the consultation about which group your case falls into. If aligners alone will not give you the result you want, we will say so and refer you to a Hamilton-area orthodontist. We would rather lose the case than over-promise the result.</p>"),
        ("Attachments, IPR, and the things people do not realize aligners do",
         "<p>Most aligner cases need small tooth-coloured composite bumps (called attachments) on certain teeth. They give the aligner leverage to move that tooth in a specific direction. They come off cleanly at the end of treatment. Some cases also need interproximal reduction (IPR), where we use a very thin diamond file to remove fractions of a millimetre between specific teeth to create space for alignment. Both of these are routine, conservative, and well-tolerated. We explain them at the planning visit so there are no surprises.</p>"),
        ("Compliance, the make-or-break factor",
         "<p>Aligners need to be worn 20 to 22 hours per day. They come out for eating, drinking anything other than water, and brushing. Patients who consistently wear their aligners full-time finish on schedule. Patients who routinely leave them out for a few hours each evening drag the treatment out by months and sometimes need refinement aligners at the end to finish the case. It is one of the few medical treatments where the patient is genuinely doing more than half of the work. We will tell you the truth about this at the consultation. If a 20-hour daily commitment is not realistic for you, fixed braces are a better fit.</p>"),
        ("Retention is for life",
         "<p>The biggest mistake in aligner or braces treatment is treating the day the aligners come off as the end of the case. Teeth want to drift back toward where they started, particularly the lower front teeth. We provide a custom retainer (a thin clear retainer for the upper, a small wire bonded to the inside of the lower front teeth or another clear retainer for the lower) and ask you to wear them at night long-term. People who stop wearing retainers usually see relapse within two to five years. People who wear them nightly forever keep their result. The retainers are inexpensive to replace and last for years.</p>"),
        ("Cost and timeline in Hamilton",
         "<p>Most adult SureSmile cases run $4,500 to $7,500 depending on complexity. Treatment time averages 6 to 12 months for simpler cases, 12 to 18 months for moderate ones, and longer for complex ones. We provide a written estimate after the consultation with photos and a digital preview of the final result so you know roughly what to expect before you commit. Most private orthodontic insurance covers aligner treatment at the same rate as braces, with a lifetime maximum that varies by plan. <a href='/canadian-care-dental-plan/'>CDCP</a> generally does not cover orthodontics. <a href='/payment-plans/'>Beautifi financing</a> with 0% options on qualifying treatments is available for any out-of-pocket portion.</p>"),
    ],
}


def block_for(slug):
    items = DEEP.get(slug, [])
    if not items:
        return None
    lines = [' "deep_content": [']
    for h, body in items:
        # body is plain HTML; embed as a regular Python string literal with
        # double-quoted outer and single quotes inside (already the case).
        body_one_line = body.replace('"', '\\"')
        lines.append('  ("' + h.replace('"', '\\"') + '", "' + body_one_line + '"),')
    lines.append(' ],')
    return "\n".join(lines)


def main():
    path = "_build/content.py"
    with open(path, "r", encoding="utf-8") as f:
        src = f.read()
    out = src
    for slug, items in DEEP.items():
        block = block_for(slug)
        if not block:
            continue
        # Idempotent: if already present, replace; else insert before the
        # entry's closing `},`.
        # Locate the service-entry block.
        entry_pat = re.compile(
            r'( "' + re.escape(slug) + r'":\s*\{)(.*?)(\n \},)',
            re.DOTALL,
        )
        m = entry_pat.search(out)
        if not m:
            print("!!! could not locate", slug)
            continue
        body_text = m.group(2)
        if '"deep_content"' in body_text:
            # Replace existing deep_content
            body_text = re.sub(
                r'\s "deep_content": \[.*?\n \],',
                "\n" + block,
                body_text,
                count=1,
                flags=re.DOTALL,
            )
        else:
            # Append before the closing brace
            body_text = body_text.rstrip() + "\n" + block + "\n "
        out = out[:m.start()] + m.group(1) + body_text + m.group(3) + out[m.end():]
        print("  injected deep_content into", slug)

    with open(path, "w", encoding="utf-8") as f:
        f.write(out)
    print("done")


if __name__ == "__main__":
    main()
